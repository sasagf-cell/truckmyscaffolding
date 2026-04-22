import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /worker-hours/:projectId - Get workers and hours for a project
router.get('/:projectId', authMiddleware, async (req, res) => {
  const { projectId } = req.params;
  try {
    const [workers, hours] = await Promise.all([
      pb.collection('project_workers').getFullList({
        filter: `project_id = "${projectId}"`,
        sort: 'anonymous_id'
      }),
      pb.collection('worker_hours').getFullList({
        filter: `project_id = "${projectId}"`,
        sort: '-date',
        expand: 'worker_id'
      })
    ]);
    res.json({ workers, hours });
  } catch (error) {
    logger.error('Get worker hours error:', error.message);
    res.status(500).json({ error: 'Failed to fetch worker hours' });
  }
});

// POST /worker-hours/workers - Add anonymous worker to project
router.post('/workers', authMiddleware, async (req, res) => {
  const { project_id, role, company } = req.body;
  if (!project_id || !role || !company) {
    return res.status(400).json({ error: 'project_id, role and company are required' });
  }
  try {
    const existing = await pb.collection('project_workers').getFullList({
      filter: `project_id = "${project_id}"`
    });
    const count = existing.length + 1;
    const anonymous_id = `W-${String(count).padStart(3, '0')}`;
    const worker = await pb.collection('project_workers').create({ project_id, anonymous_id, role, company });
    res.json(worker);
  } catch (error) {
    logger.error('Add worker error:', error.message);
    res.status(500).json({ error: 'Failed to add worker' });
  }
});

// POST /worker-hours/log - Log hours for a worker
router.post('/log', authMiddleware, async (req, res) => {
  const { project_id, worker_id, date, regular_hours, overtime_hours, notes } = req.body;
  if (!project_id || !worker_id || !date || regular_hours === undefined) {
    return res.status(400).json({ error: 'project_id, worker_id, date and regular_hours are required' });
  }
  try {
    const entry = await pb.collection('worker_hours').create({
      project_id,
      worker_id,
      date,
      regular_hours: parseFloat(regular_hours),
      overtime_hours: parseFloat(overtime_hours || 0),
      notes: notes || ''
    });
    res.json(entry);
  } catch (error) {
    logger.error('Log hours error:', error.message);
    res.status(500).json({ error: 'Failed to log hours' });
  }
});

// GET /worker-hours/:projectId/report - Aggregate report
router.get('/:projectId/report', authMiddleware, async (req, res) => {
  const { projectId } = req.params;
  try {
    const hours = await pb.collection('worker_hours').getFullList({
      filter: `project_id = "${projectId}"`,
      expand: 'worker_id'
    });
    const totalRegular = hours.reduce((s, h) => s + (h.regular_hours || 0), 0);
    const totalOvertime = hours.reduce((s, h) => s + (h.overtime_hours || 0), 0);
    const byWorker = {};
    hours.forEach(h => {
      const id = h.expand?.worker_id?.anonymous_id || h.worker_id;
      if (!byWorker[id]) byWorker[id] = { regular: 0, overtime: 0 };
      byWorker[id].regular += h.regular_hours || 0;
      byWorker[id].overtime += h.overtime_hours || 0;
    });
    res.json({ totalRegular, totalOvertime, total: totalRegular + totalOvertime, byWorker });
  } catch (error) {
    logger.error('Worker hours report error:', error.message);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

export default router;
