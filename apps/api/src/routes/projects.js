import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /projects - Get user's projects
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await pb.collection('projects').getFullList({
      filter: `user_id = "${req.user.id}"`,
      sort: '-created',
    });

    res.json(projects);
  } catch (error) {
    logger.error('Get projects error:', error.message);
    throw error;
  }
});

// POST /projects - Create new project
router.post('/', authMiddleware, async (req, res) => {
  const { name, location, description, scaffold_prefix } = req.body;

  if (!name || !location) {
    return res.status(400).json({ error: 'Name and location are required' });
  }

  try {
    const project = await pb.collection('projects').create({
      user_id: req.user.id,
      name,
      location,
      description: description || '',
      scaffold_prefix: scaffold_prefix || '',
      status: 'active',
    });

    res.status(201).json(project);
  } catch (error) {
    logger.error('Create project error:', error.message);
    throw error;
  }
});

// GET /projects/:id/scaffolds - Get scaffold requests for project
router.get('/:id/scaffolds', authMiddleware, async (req, res) => {
  const { status, contractor_id, date_range, section, page = 1, perPage = 20 } = req.query;

  try {
    let filter = `project_id = "${req.params.id}"`;

    if (status) {
      filter += ` && status = "${status}"`;
    }
    if (contractor_id) {
      filter += ` && contractor_id = "${contractor_id}"`;
    }
    if (section) {
      filter += ` && section = "${section}"`;
    }

    const scaffolds = await pb.collection('scaffold_requests').getList(page, perPage, {
      filter,
      sort: '-created',
      expand: 'contractor_id,worker_hours_via_scaffold_id',
    });

    res.json(scaffolds);
  } catch (error) {
    logger.error('Get scaffolds error:', error.message);
    throw error;
  }
});

// POST /projects/:id/scaffolds - Create scaffold request
router.post('/:id/scaffolds', authMiddleware, async (req, res) => {
  const { contractor_id, location, installation_level, start_date, end_date, workers, description } = req.body;

  if (!contractor_id || !location || !installation_level || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const scaffold = await pb.collection('scaffold_requests').create({
      project_id: req.params.id,
      contractor_id,
      location,
      installation_level,
      start_date,
      end_date,
      description: description || '',
      status: 'pending',
    });

    // Create worker_hours records
    if (workers && Array.isArray(workers)) {
      for (const worker of workers) {
        await pb.collection('worker_hours').create({
          scaffold_id: scaffold.id,
          worker_name: worker.name,
          hours: worker.hours,
          date: worker.date,
        });
      }
    }

    res.status(201).json(scaffold);
  } catch (error) {
    logger.error('Create scaffold error:', error.message);
    throw error;
  }
});

// PUT /projects/:id/scaffolds/:scaffoldId - Update scaffold
router.put('/:id/scaffolds/:scaffoldId', authMiddleware, async (req, res) => {
  const { location, installation_level, start_date, end_date, workers, description } = req.body;

  try {
    const updateData = {};
    if (location) updateData.location = location;
    if (installation_level) updateData.installation_level = installation_level;
    if (start_date) updateData.start_date = start_date;
    if (end_date) updateData.end_date = end_date;
    if (description) updateData.description = description;

    const scaffold = await pb.collection('scaffold_requests').update(req.params.scaffoldId, updateData);

    // Update worker_hours if provided
    if (workers && Array.isArray(workers)) {
      const existingWorkers = await pb.collection('worker_hours').getFullList({
        filter: `scaffold_id = "${req.params.scaffoldId}"`,
      });

      // Delete existing workers
      for (const worker of existingWorkers) {
        await pb.collection('worker_hours').delete(worker.id);
      }

      // Create new workers
      for (const worker of workers) {
        await pb.collection('worker_hours').create({
          scaffold_id: req.params.scaffoldId,
          worker_name: worker.name,
          hours: worker.hours,
          date: worker.date,
        });
      }
    }

    res.json(scaffold);
  } catch (error) {
    logger.error('Update scaffold error:', error.message);
    throw error;
  }
});

// POST /projects/:id/scaffolds/:scaffoldId/approve - Approve scaffold
router.post('/:id/scaffolds/:scaffoldId/approve', authMiddleware, async (req, res) => {
  try {
    const scaffold = await pb.collection('scaffold_requests').update(req.params.scaffoldId, {
      status: 'active',
    });

    // Create notification for subcontractor
    const contractor = await pb.collection('subcontractors').getOne(scaffold.contractor_id);
    await pb.collection('notifications').create({
      user_id: contractor.user_id,
      project_id: req.params.id,
      type: 'scaffold_approved',
      message: `Your scaffold request for ${scaffold.location} has been approved`,
      related_item_id: req.params.scaffoldId,
      read: false,
    });

    res.json(scaffold);
  } catch (error) {
    logger.error('Approve scaffold error:', error.message);
    throw error;
  }
});

// POST /projects/:id/scaffolds/:scaffoldId/reject - Reject scaffold
router.post('/:id/scaffolds/:scaffoldId/reject', authMiddleware, async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({ error: 'Reason is required' });
  }

  try {
    const scaffold = await pb.collection('scaffold_requests').update(req.params.scaffoldId, {
      status: 'rejected',
      rejection_reason: reason,
    });

    // Create notification for subcontractor
    const contractor = await pb.collection('subcontractors').getOne(scaffold.contractor_id);
    await pb.collection('notifications').create({
      user_id: contractor.user_id,
      project_id: req.params.id,
      type: 'scaffold_rejected',
      message: `Your scaffold request for ${scaffold.location} has been rejected. Reason: ${reason}`,
      related_item_id: req.params.scaffoldId,
      read: false,
    });

    res.json(scaffold);
  } catch (error) {
    logger.error('Reject scaffold error:', error.message);
    throw error;
  }
});

// GET /projects/:id/diary - Get diary entries
router.get('/:id/diary', authMiddleware, async (req, res) => {
  const { date_range, month, page = 1, perPage = 20 } = req.query;

  try {
    let filter = `project_id = "${req.params.id}"`;

    if (month) {
      filter += ` && month = "${month}"`;
    }

    const entries = await pb.collection('diary_entries').getList(page, perPage, {
      filter,
      sort: '-date',
    });

    res.json(entries);
  } catch (error) {
    logger.error('Get diary entries error:', error.message);
    throw error;
  }
});

// POST /projects/:id/diary - Create diary entry
router.post('/:id/diary', authMiddleware, async (req, res) => {
  const { date, content, weather, workers_on_site } = req.body;

  if (!date || !content) {
    return res.status(400).json({ error: 'Date and content are required' });
  }

  try {
    const entry = await pb.collection('diary_entries').create({
      project_id: req.params.id,
      user_id: req.user.id,
      date,
      content,
      weather: weather || '',
      workers_on_site: workers_on_site || 0,
      month: new Date(date).toISOString().slice(0, 7),
    });

    res.status(201).json(entry);
  } catch (error) {
    logger.error('Create diary entry error:', error.message);
    throw error;
  }
});

// GET /projects/:id/deliveries - Get material deliveries
router.get('/:id/deliveries', authMiddleware, async (req, res) => {
  const { date_range, page = 1, perPage = 20 } = req.query;

  try {
    let filter = `project_id = "${req.params.id}"`;

    const deliveries = await pb.collection('material_deliveries').getList(page, perPage, {
      filter,
      sort: '-delivery_date',
      expand: 'material_items_via_delivery_id',
    });

    res.json(deliveries);
  } catch (error) {
    logger.error('Get deliveries error:', error.message);
    throw error;
  }
});

// POST /projects/:id/deliveries - Create material delivery
router.post('/:id/deliveries', authMiddleware, async (req, res) => {
  const { delivery_date, supplier, items } = req.body;

  if (!delivery_date || !supplier || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Get next delivery number
    const lastDelivery = await pb.collection('material_deliveries').getFullList({
      filter: `project_id = "${req.params.id}"`,
      sort: '-delivery_number',
      limit: 1,
    });

    const nextNumber = lastDelivery.length > 0 ? lastDelivery[0].delivery_number + 1 : 1;

    const delivery = await pb.collection('material_deliveries').create({
      project_id: req.params.id,
      delivery_date,
      supplier,
      delivery_number: nextNumber,
      status: 'received',
    });

    // Create material items
    for (const item of items) {
      await pb.collection('material_items').create({
        delivery_id: delivery.id,
        material_name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        description: item.description || '',
      });
    }

    res.status(201).json(delivery);
  } catch (error) {
    logger.error('Create delivery error:', error.message);
    throw error;
  }
});

// GET /projects/:id/subcontractors - Get project subcontractors
router.get('/:id/subcontractors', authMiddleware, async (req, res) => {
  try {
    const subcontractors = await pb.collection('subcontractors').getFullList({
      filter: `project_id = "${req.params.id}"`,
      sort: '-created',
    });

    res.json(subcontractors);
  } catch (error) {
    logger.error('Get subcontractors error:', error.message);
    throw error;
  }
});

// POST /projects/:id/subcontractors - Create subcontractor
router.post('/:id/subcontractors', authMiddleware, async (req, res) => {
  const { company_name, contact_person, email } = req.body;

  if (!company_name || !contact_person || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const inviteToken = require('crypto').randomBytes(32).toString('hex');

    const subcontractor = await pb.collection('subcontractors').create({
      project_id: req.params.id,
      company_name,
      contact_person,
      email,
      status: 'pending_invite',
      invite_token: inviteToken,
      invite_token_expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    res.status(201).json(subcontractor);
  } catch (error) {
    logger.error('Create subcontractor error:', error.message);
    throw error;
  }
});

// POST /projects/:id/subcontractors/:subId/invite - Send invitation
router.post('/:id/subcontractors/:subId/invite', authMiddleware, async (req, res) => {
  try {
    const subcontractor = await pb.collection('subcontractors').getOne(req.params.subId);

    // TODO: Send invitation email
    // const inviteLink = `${process.env.FRONTEND_URL}/invite?token=${subcontractor.invite_token}`;
    // await sendEmail(subcontractor.email, 'Project Invitation', `You have been invited to join a project: ${inviteLink}`);

    await pb.collection('subcontractors').update(req.params.subId, {
      status: 'pending_invite',
    });

    logger.info(`Invitation sent to subcontractor: ${req.params.subId}`);

    res.json({ message: 'Invite sent' });
  } catch (error) {
    logger.error('Send invite error:', error.message);
    throw error;
  }
});

// GET /projects/:id/notifications - Get notifications
router.get('/:id/notifications', authMiddleware, async (req, res) => {
  const { unread_only, page = 1, perPage = 20 } = req.query;

  try {
    let filter = `user_id = "${req.user.id}" && project_id = "${req.params.id}"`;

    if (unread_only === 'true') {
      filter += ' && read = false';
    }

    const notifications = await pb.collection('notifications').getList(page, perPage, {
      filter,
      sort: '-created',
    });

    res.json(notifications);
  } catch (error) {
    logger.error('Get notifications error:', error.message);
    throw error;
  }
});

// POST /projects/:id/notifications/:notifId/read - Mark notification as read
router.post('/:id/notifications/:notifId/read', authMiddleware, async (req, res) => {
  try {
    const notification = await pb.collection('notifications').update(req.params.notifId, {
      read: true,
    });

    res.json(notification);
  } catch (error) {
    logger.error('Mark notification read error:', error.message);
    throw error;
  }
});

// GET /projects/:id/reports - Generate project report
router.get('/:id/reports', authMiddleware, async (req, res) => {
  const { type = 'daily', date_range } = req.query;

  try {
    const project = await pb.collection('projects').getOne(req.params.id);

    // Get scaffolds
    const scaffolds = await pb.collection('scaffold_requests').getFullList({
      filter: `project_id = "${req.params.id}"`,
    });

    // Get diary entries
    const diaryEntries = await pb.collection('diary_entries').getFullList({
      filter: `project_id = "${req.params.id}"`,
    });

    // Get deliveries
    const deliveries = await pb.collection('material_deliveries').getFullList({
      filter: `project_id = "${req.params.id}"`,
    });

    // Get worker hours
    const workerHours = await pb.collection('worker_hours').getFullList();

    const report = {
      project: {
        id: project.id,
        name: project.name,
        location: project.location,
      },
      summary: {
        total_scaffolds: scaffolds.length,
        active_scaffolds: scaffolds.filter(s => s.status === 'active').length,
        pending_scaffolds: scaffolds.filter(s => s.status === 'pending').length,
        total_diary_entries: diaryEntries.length,
        total_deliveries: deliveries.length,
      },
      scaffolds: scaffolds.map(s => ({
        id: s.id,
        location: s.location,
        status: s.status,
        start_date: s.start_date,
        end_date: s.end_date,
      })),
      workers: workerHours.map(w => ({
        name: w.worker_name,
        hours: w.hours,
        date: w.date,
      })),
      diary: diaryEntries.map(d => ({
        date: d.date,
        content: d.content,
        workers_on_site: d.workers_on_site,
      })),
      deliveries: deliveries.map(d => ({
        delivery_number: d.delivery_number,
        date: d.delivery_date,
        supplier: d.supplier,
      })),
      alerts: [],
    };

    res.json(report);
  } catch (error) {
    logger.error('Generate report error:', error.message);
    throw error;
  }
});

export default router;
