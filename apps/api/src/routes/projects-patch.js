import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// PATCH /projects/:projectId - Update project
router.patch('/:projectId', authMiddleware, async (req, res) => {
  const {
    name, location, type, startDate, endDate, description, status,
    // Sprint 3 — Project Configuration fields
    contract_type, scaffold_system, inspection_interval_days,
    rate, rate_currency, rate_unit,
  } = req.body;
  const projectId = req.params.projectId;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (location !== undefined) updateData.location = location;
  if (type !== undefined) updateData.type = type;
  if (startDate !== undefined) updateData.start_date = startDate;
  if (endDate !== undefined) updateData.end_date = endDate;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) updateData.status = status;

  // Project Configuration (Sprint 3)
  if (contract_type !== undefined) updateData.contract_type = contract_type;
  if (scaffold_system !== undefined) updateData.scaffold_system = scaffold_system;
  if (inspection_interval_days !== undefined) updateData.inspection_interval_days = Number(inspection_interval_days);
  if (rate !== undefined) updateData.rate = rate === '' ? null : Number(rate);
  if (rate_currency !== undefined) updateData.rate_currency = rate_currency;
  if (rate_unit !== undefined) updateData.rate_unit = rate_unit;

  const updatedProject = await pb.collection('projects').update(projectId, updateData);

  res.json({
    success: true,
    project: updatedProject,
  });
});

export default router;
