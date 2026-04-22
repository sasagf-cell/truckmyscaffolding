
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /reports/daily
router.get('/daily', authMiddleware, async (req, res) => {
  const { projectId, date } = req.query;
  if (!projectId || !date) {
    throw new Error('projectId and date are required');
  }

  const targetDate = new Date(date);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);
  
  const dateStr = targetDate.toISOString().split('T')[0];
  const nextDayStr = nextDay.toISOString().split('T')[0];

  const diaryEntries = await pb.collection('diary_entries').getFullList({
    filter: `project_id = "${projectId}" && date >= "${dateStr}" && date < "${nextDayStr}"`
  });
  const diaryEntry = diaryEntries.length > 0 ? diaryEntries[0] : null;

  const scaffoldRequests = await pb.collection('scaffold_requests').getFullList({
    filter: `projectId = "${projectId}" && created >= "${dateStr}" && created < "${nextDayStr}"`
  });

  const materialDeliveries = await pb.collection('material_deliveries').getFullList({
    filter: `project_id = "${projectId}" && delivery_date >= "${dateStr}" && delivery_date < "${nextDayStr}"`
  });

  const alerts = await pb.collection('alerts').getFullList({
    filter: `project_id = "${projectId}" && created >= "${dateStr}" && created < "${nextDayStr}"`
  });

  res.json({ diaryEntry, scaffoldRequests, materialDeliveries, alerts });
});

// GET /reports/monthly
router.get('/monthly', authMiddleware, async (req, res) => {
  const { projectId, month } = req.query;
  if (!projectId || !month) {
    throw new Error('projectId and month are required');
  }

  const [year, monthNum] = month.split('-');
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 1);
  
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  const diaryEntries = await pb.collection('diary_entries').getFullList({
    filter: `project_id = "${projectId}" && date >= "${startStr}" && date < "${endStr}"`
  });

  const scaffoldRequests = await pb.collection('scaffold_requests').getFullList({
    filter: `projectId = "${projectId}" && created >= "${startStr}" && created < "${endStr}"`
  });

  const materialDeliveries = await pb.collection('material_deliveries').getFullList({
    filter: `project_id = "${projectId}" && delivery_date >= "${startStr}" && delivery_date < "${endStr}"`
  });

  const alerts = await pb.collection('alerts').getFullList({
    filter: `project_id = "${projectId}" && created >= "${startStr}" && created < "${endStr}"`
  });

  // Aggregations
  const totalDays = new Date(year, monthNum, 0).getDate();
  const requestsByStatus = scaffoldRequests.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {});
  
  const totalWorkerHours = scaffoldRequests.reduce((sum, req) => {
    const hours = req.workerHours ? req.workerHours.reduce((hSum, w) => hSum + (w.hours || 0), 0) : 0;
    return sum + hours;
  }, 0);

  const totalCost = scaffoldRequests.reduce((sum, req) => sum + (req.totalCost || 0), 0);

  const alertsSummary = alerts.reduce((acc, alert) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1;
    return acc;
  }, {});

  res.json({
    summary: {
      totalDiaryEntries: diaryEntries.length,
      totalDays,
      totalRequests: scaffoldRequests.length,
      requestsByStatus,
      totalDeliveries: materialDeliveries.length,
      totalWorkerHours,
      totalCost
    },
    diaryEntries,
    scaffoldRequests,
    materialDeliveries,
    alertsSummary
  });
});

// POST /reports/send-email
router.post('/send-email', authMiddleware, async (req, res) => {
  const { projectId, reportType, date, recipientEmail, cc, subject, message } = req.body;
  
  if (!projectId || !reportType || !date || !recipientEmail) {
    throw new Error('Missing required fields for sending email');
  }

  try {
    // Create audit record in PocketBase
    const reportRecord = await pb.collection('reports').create({
      project_id: projectId,
      type: reportType,
      date: date,
      generated_by: req.user.id,
      sent_to: recipientEmail,
      sent_at: new Date().toISOString()
    });

    // In a full production environment, we would generate the PDF here using puppeteer/pdfkit
    // and send it via nodemailer or a transactional email service.
    // For this implementation, we log the action and return success.
    logger.info(`Report email simulated for ${recipientEmail} (Report ID: ${reportRecord.id})`);

    res.json({ success: true, messageId: reportRecord.id });
  } catch (error) {
    logger.error('Error sending report email:', error);
    throw error;
  }
});

export default router;
