import express from 'express';
import crypto from 'crypto';
import { authMiddleware } from '../middleware/auth.js';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /projects/:projectId/qr-token - Generate QR token for project
router.post('/projects/:projectId/qr-token', authMiddleware, async (req, res) => {
  const { projectId } = req.params;
  try {
    // Verify user owns this project
    const project = await pb.collection('projects').getOne(projectId);
    if (project.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await pb.collection('qr_tokens').create({ project_id: projectId, token, expires_at, used: false });
    res.json({ token, expires_at, project_name: project.name });
  } catch (error) {
    logger.error('Generate QR token error:', error.message);
    res.status(500).json({ error: 'Failed to generate QR token' });
  }
});

// GET /join/:token - Validate QR token
router.get('/join/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const records = await pb.collection('qr_tokens').getFullList({
      filter: `token = "${token}"`,
      expand: 'project_id'
    });
    if (!records.length) return res.status(404).json({ error: 'Invalid token' });
    const record = records[0];
    if (record.used) return res.status(410).json({ error: 'Token already used' });
    if (new Date(record.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Token expired', expired: true });
    }
    res.json({ valid: true, project_name: record.expand?.project_id?.name || 'Project', project_id: record.project_id });
  } catch (error) {
    logger.error('Validate QR token error:', error.message);
    res.status(500).json({ error: 'Failed to validate token' });
  }
});

// POST /join/:token/accept - Accept invite and join project
router.post('/join/:token/accept', authMiddleware, async (req, res) => {
  const { token } = req.params;
  try {
    const records = await pb.collection('qr_tokens').getFullList({
      filter: `token = "${token}"`
    });
    if (!records.length) return res.status(404).json({ error: 'Invalid token' });
    const record = records[0];
    if (record.used) return res.status(410).json({ error: 'Token already used' });
    if (new Date(record.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Token expired' });
    }

    // Check not already a member
    const existing = await pb.collection('subcontractors').getFullList({
      filter: `userId = "${req.user.id}" && projectId = "${record.project_id}"`
    });
    if (!existing.length) {
      await pb.collection('subcontractors').create({
        userId: req.user.id,
        projectId: record.project_id,
        status: 'active',
        role: 'Site Team',
        permissions: ['view_scaffold_requests', 'create_scaffold_requests', 'view_site_diary', 'view_material_deliveries']
      });
    }

    // Mark token as used
    await pb.collection('qr_tokens').update(record.id, { used: true });
    res.json({ success: true });
  } catch (error) {
    logger.error('Accept QR invite error:', error.message);
    res.status(500).json({ error: 'Failed to join project' });
  }
});

export default router;
