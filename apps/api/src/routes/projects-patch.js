import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// PATCH /projects/:projectId - Update project
router.patch('/:projectId', authMiddleware, async (req, res) => {
  const { name, location, type, startDate, endDate, description, status } = req.body;
  const projectId = req.params.projectId;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (location !== undefined) updateData.location = location;
  if (type !== undefined) updateData.type = type;
  if (startDate !== undefined) updateData.start_date = startDate;
  if (endDate !== undefined) updateData.end_date = endDate;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) updateData.status = status;

  const updatedProject = await pb.collection('projects').update(projectId, updateData);

  res.json({
    success: true,
    project: updatedProject,
  });
});

export default router;
