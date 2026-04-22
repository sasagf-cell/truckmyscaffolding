import 'dotenv/config';
import cron from 'node-cron';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import emailService from '../services/emailService.js';

// 1. Day 3 Follow-up Job
export function startDay3FollowupJob() {
  cron.schedule('0 9 * * *', async () => {
    try {
      logger.info('Starting Day 3 Follow-up job...');

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const threeDaysAgoStr = threeDaysAgo.toISOString();

      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() - 2);
      const threeDaysFromNowStr = threeDaysFromNow.toISOString();

      // Query users created exactly 3 days ago with no projects
      const users = await pb.collection('users').getFullList({
        filter: `created >= "${threeDaysAgoStr}" && created < "${threeDaysFromNowStr}"`,
      });

      let emailsSent = 0;

      for (const user of users) {
        // Check if user has any projects
        const projects = await pb.collection('projects').getFullList({
          filter: `user_id = "${user.id}"`,
        });

        if (projects.length === 0) {
          const setupUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/setup`;
          const result = await emailService.sendDay3FollowupEmail({
            to: user.email,
            firstName: user.full_name || 'User',
            setupUrl,
            userId: user.id,
          });

          if (result.success) {
            emailsSent++;
          }
        }
      }

      logger.info(`Day 3 Follow-up job completed. Emails sent: ${emailsSent}`);
    } catch (error) {
      logger.error(`Day 3 Follow-up job error: ${error.message}`);
    }
  });
}

// 2. Pending Reminder Job
export function startPendingReminderJob() {
  cron.schedule('0 10 * * *', async () => {
    try {
      logger.info('Starting Pending Reminder job...');

      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const oneDayAgoStr = oneDayAgo.toISOString();

      // Query pending scaffold requests created >24 hours ago
      const pendingRequests = await pb.collection('scaffold_requests').getFullList({
        filter: `status = "pending" && created < "${oneDayAgoStr}"`,
        expand: 'project_id',
      });

      // Group by project owner
      const coordinatorMap = {};

      for (const request of pendingRequests) {
        const projectId = request.project_id;
        const project = request.expand?.project_id;

        if (project && project.user_id) {
          if (!coordinatorMap[project.user_id]) {
            coordinatorMap[project.user_id] = {
              projectId,
              pendingCount: 0,
            };
          }
          coordinatorMap[project.user_id].pendingCount++;
        }
      }

      let emailsSent = 0;

      // Send reminder emails to coordinators
      for (const [userId, data] of Object.entries(coordinatorMap)) {
        const user = await pb.collection('users').getOne(userId);
        const reviewUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/projects/${data.projectId}/requests?status=pending`;

        const result = await emailService.sendPendingReminderEmail({
          to: user.email,
          firstName: user.full_name || 'Coordinator',
          pendingCount: data.pendingCount,
          reviewUrl,
          userId: user.id,
        });

        if (result.success) {
          emailsSent++;
        }
      }

      logger.info(`Pending Reminder job completed. Emails sent: ${emailsSent}`);
    } catch (error) {
      logger.error(`Pending Reminder job error: ${error.message}`);
    }
  });
}

// 3. Monthly Report Job
export function startMonthlyReportJob() {
  // Cron for first day of month at 17:00 (for previous month stats)
  cron.schedule('0 17 1 * *', async () => {
    try {
      logger.info('Starting Monthly Report job...');

      // Get all active coordinators (users with role='coordinator' or users with projects)
      const users = await pb.collection('users').getFullList();

      const currentDate = new Date();
      const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      let emailsSent = 0;

      for (const user of users) {
        // Get user's projects
        const projects = await pb.collection('projects').getFullList({
          filter: `user_id = "${user.id}"`,
        });

        if (projects.length === 0) continue;

        // Aggregate stats for all user's projects
        let totalRequests = 0;
        let approved = 0;
        let rejected = 0;
        let pending = 0;
        let activeScaffolds = 0;
        let totalHours = 0;

        for (const project of projects) {
          const requests = await pb.collection('scaffold_requests').getFullList({
            filter: `project_id = "${project.id}"`,
          });

          totalRequests += requests.length;
          approved += requests.filter(r => r.status === 'approved').length;
          rejected += requests.filter(r => r.status === 'rejected').length;
          pending += requests.filter(r => r.status === 'pending').length;
          activeScaffolds += requests.filter(r => r.status === 'active').length;

          // Sum worker hours
          const workerHours = await pb.collection('worker_hours').getFullList({
            filter: `scaffold_id IN (${requests.map(r => `"${r.id}"`).join(',')})`,
          });

          totalHours += workerHours.reduce((sum, w) => sum + (w.hours || 0), 0);
        }

        const reportUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reports?month=${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

        const result = await emailService.sendMonthlyReportReadyEmail({
          to: user.email,
          firstName: user.full_name || 'Coordinator',
          monthYear,
          totalRequests,
          approved,
          rejected,
          pending,
          activeScaffolds,
          totalHours,
          reportUrl,
          userId: user.id,
        });

        if (result.success) {
          emailsSent++;
        }
      }

      logger.info(`Monthly Report job completed. Emails sent: ${emailsSent}`);
    } catch (error) {
      logger.error(`Monthly Report job error: ${error.message}`);
    }
  });
}

// 4. Free Plan Limit Job (triggered when scaffold request created)
export async function checkAndSendFreePlanLimitEmail(userId) {
  try {
    const user = await pb.collection('users').getOne(userId);

    if (user.plan !== 'free') {
      return;
    }

    // Count user's scaffold requests
    const requests = await pb.collection('scaffold_requests').getFullList({
      filter: `createdBy = "${userId}"`,
    });

    if (requests.length >= 20) {
      const pricingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing`;

      const result = await emailService.sendFreePlanLimitEmail({
        to: user.email,
        firstName: user.full_name || 'User',
        pricingUrl,
        userId: user.id,
      });

      if (result.success) {
        logger.info(`Free plan limit email sent to user ${userId}`);
      }
    }
  } catch (error) {
    logger.error(`Free plan limit check error: ${error.message}`);
  }
}

export default {
  startDay3FollowupJob,
  startPendingReminderJob,
  startMonthlyReportJob,
  checkAndSendFreePlanLimitEmail,
};
