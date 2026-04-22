import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import emailService from '../services/emailService.js';

const router = express.Router();

// POST /email/test - Send test email
router.post('/test', authMiddleware, async (req, res) => {
  const { emailType, testVariables, to } = req.body;

  if (!emailType || !to) {
    return res.status(400).json({ error: 'emailType and to are required' });
  }

  const testVars = testVariables || {};
  const defaultVars = {
    firstName: 'John',
    setupUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/setup`,
    coordinatorName: 'Jane Coordinator',
    coordinatorCompany: 'ABC Construction',
    projectName: 'Downtown Project',
    accessUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/projects/123`,
    requestId: 'REQ-001',
    scaffoldNumber: 'SCAF-001',
    subcontractorName: 'XYZ Scaffolding',
    plantSection: 'Section A',
    installationLevel: 'Level 3',
    startDate: '2024-01-15',
    endDate: '2024-01-30',
    reviewUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/requests/123`,
    approvedDate: '2024-01-14',
    approvedTime: '10:30 AM',
    detailUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/requests/123`,
    coordinatorComment: 'Please adjust the installation level to Level 2.',
    editUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/requests/123/edit`,
    pendingCount: 3,
    monthYear: 'January 2024',
    totalRequests: 15,
    approved: 10,
    rejected: 2,
    pending: 3,
    activeScaffolds: 8,
    totalHours: 240,
    reportUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reports`,
    pricingUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing`,
    planName: 'Professional',
    amount: '49.00',
    billingPeriod: 'monthly',
    nextBillingDate: '2024-02-14',
    accountUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/account`,
  };

  const vars = { ...defaultVars, ...testVars };

  let result;

  switch (emailType) {
    case 'welcome':
      result = await emailService.sendWelcomeEmail({
        to,
        firstName: vars.firstName,
        setupUrl: vars.setupUrl,
        userId: req.user.id,
      });
      break;
    case 'day3_followup':
      result = await emailService.sendDay3FollowupEmail({
        to,
        firstName: vars.firstName,
        setupUrl: vars.setupUrl,
        userId: req.user.id,
      });
      break;
    case 'subuser_welcome':
      result = await emailService.sendSubuserWelcomeEmail({
        to,
        firstName: vars.firstName,
        coordinatorName: vars.coordinatorName,
        coordinatorCompany: vars.coordinatorCompany,
        projectName: vars.projectName,
        accessUrl: vars.accessUrl,
        userId: req.user.id,
      });
      break;
    case 'request_submitted':
      result = await emailService.sendRequestSubmittedEmail({
        to,
        firstName: vars.firstName,
        requestId: vars.requestId,
        scaffoldNumber: vars.scaffoldNumber,
        subcontractorName: vars.subcontractorName,
        plantSection: vars.plantSection,
        installationLevel: vars.installationLevel,
        startDate: vars.startDate,
        endDate: vars.endDate,
        reviewUrl: vars.reviewUrl,
        userId: req.user.id,
      });
      break;
    case 'request_approved':
      result = await emailService.sendRequestApprovedEmail({
        to,
        firstName: vars.firstName,
        requestId: vars.requestId,
        scaffoldNumber: vars.scaffoldNumber,
        plantSection: vars.plantSection,
        coordinatorName: vars.coordinatorName,
        approvedDate: vars.approvedDate,
        approvedTime: vars.approvedTime,
        detailUrl: vars.detailUrl,
        userId: req.user.id,
      });
      break;
    case 'request_rejected':
      result = await emailService.sendRequestRejectedEmail({
        to,
        firstName: vars.firstName,
        requestId: vars.requestId,
        scaffoldNumber: vars.scaffoldNumber,
        plantSection: vars.plantSection,
        coordinatorName: vars.coordinatorName,
        coordinatorComment: vars.coordinatorComment,
        viewUrl: vars.reviewUrl,
        userId: req.user.id,
      });
      break;
    case 'changes_requested':
      result = await emailService.sendChangesRequestedEmail({
        to,
        firstName: vars.firstName,
        requestId: vars.requestId,
        scaffoldNumber: vars.scaffoldNumber,
        plantSection: vars.plantSection,
        coordinatorName: vars.coordinatorName,
        coordinatorComment: vars.coordinatorComment,
        editUrl: vars.editUrl,
        userId: req.user.id,
      });
      break;
    case 'pending_reminder':
      result = await emailService.sendPendingReminderEmail({
        to,
        firstName: vars.firstName,
        pendingCount: vars.pendingCount,
        reviewUrl: vars.reviewUrl,
        userId: req.user.id,
      });
      break;
    case 'monthly_report':
      result = await emailService.sendMonthlyReportReadyEmail({
        to,
        firstName: vars.firstName,
        monthYear: vars.monthYear,
        totalRequests: vars.totalRequests,
        approved: vars.approved,
        rejected: vars.rejected,
        pending: vars.pending,
        activeScaffolds: vars.activeScaffolds,
        totalHours: vars.totalHours,
        reportUrl: vars.reportUrl,
        userId: req.user.id,
      });
      break;
    case 'free_plan_limit':
      result = await emailService.sendFreePlanLimitEmail({
        to,
        firstName: vars.firstName,
        pricingUrl: vars.pricingUrl,
        userId: req.user.id,
      });
      break;
    case 'payment_confirmation':
      result = await emailService.sendPaymentConfirmationEmail({
        to,
        firstName: vars.firstName,
        planName: vars.planName,
        amount: vars.amount,
        billingPeriod: vars.billingPeriod,
        nextBillingDate: vars.nextBillingDate,
        accountUrl: vars.accountUrl,
        userId: req.user.id,
      });
      break;
    default:
      return res.status(400).json({ error: 'Invalid emailType' });
  }

  res.json(result);
});

// GET /email/unsubscribe - Unsubscribe from emails
router.get('/unsubscribe', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Unsubscribe token is required' });
  }

  try {
    // Find user by unsubscribe token
    const users = await pb.collection('users').getFullList({
      filter: `unsubscribe_token = "${token}"`,
    });

    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid unsubscribe token' });
    }

    const user = users[0];

    // Mark user as unsubscribed
    await pb.collection('users').update(user.id, {
      email_unsubscribed: true,
    });

    logger.info(`User ${user.id} unsubscribed from emails`);

    res.json({ success: true, message: 'You have been unsubscribed from emails' });
  } catch (error) {
    logger.error(`Unsubscribe error: ${error.message}`);
    throw error;
  }
});

// POST /email/preferences - Update email preferences
router.post('/preferences', authMiddleware, async (req, res) => {
  const { preferences } = req.body;
  const userId = req.user.id;

  if (!preferences || typeof preferences !== 'object') {
    return res.status(400).json({ error: 'preferences must be an object' });
  }

  try {
    await pb.collection('users').update(userId, {
      email_preferences: preferences,
    });

    logger.info(`Email preferences updated for user ${userId}`);

    res.json({ success: true, message: 'Email preferences updated' });
  } catch (error) {
    logger.error(`Update preferences error: ${error.message}`);
    throw error;
  }
});

// GET /email/logs - Get email logs (admin only)
router.get('/logs', authMiddleware, async (req, res) => {
  const { type, recipient, status, page = 1, limit = 20 } = req.query;
  const userId = req.user.id;

  try {
    // Check if user is admin
    const user = await pb.collection('users').getOne(userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    let filter = '';

    if (type) {
      filter += `emailType = "${type}"`;
    }
    if (recipient) {
      filter += (filter ? ' && ' : '') + `recipient ~ "${recipient}"`;
    }
    if (status) {
      filter += (filter ? ' && ' : '') + `status = "${status}"`;
    }

    const logs = await pb.collection('email_logs').getList(page, limit, {
      filter: filter || undefined,
      sort: '-timestamp',
    });

    res.json({
      logs: logs.items,
      total: logs.totalItems,
      page: logs.page,
      limit: logs.perPage,
    });
  } catch (error) {
    logger.error(`Get email logs error: ${error.message}`);
    throw error;
  }
});

export default router;
