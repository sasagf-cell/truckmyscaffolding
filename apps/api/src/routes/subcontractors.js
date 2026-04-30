
import express from 'express';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { authMiddleware } from '../middleware/auth.js';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { sendEmail, buildInviteEmail } from '../utils/mailer.js';

const router = express.Router();

// POST /invite - Generate invite token and create record
router.post('/invite', authMiddleware, async (req, res, next) => {
  try {
    const { projectId, email, role, permissions, message } = req.body;

    if (!projectId || !email || !role) {
      return res.status(400).json({ error: 'projectId, email, and role are required' });
    }

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days expiry

    // Create the site team invite record
    await pb.collection('site_team_invites').create({
      projectId,
      email,
      role,
      status: 'pending_invite',
      permissions: permissions || [],
      inviteToken,
      inviteTokenExpiry: expiryDate.toISOString(),
      createdBy: req.user.id
    });

    const inviteUrl = `${process.env.FRONTEND_URL || 'https://trackmyscaffolding.com'}/join?token=${inviteToken}`;

    // Fetch project and coordinator details for the email
    let projectName = 'your project';
    let coordinatorName = 'Your Project Coordinator';
    try {
      const project = await pb.collection('projects').getOne(projectId);
      projectName = project.name || projectName;
      const coordinator = await pb.collection('users').getOne(req.user.id);
      coordinatorName = coordinator.full_name || coordinator.name || coordinatorName;
    } catch (e) {
      logger.warn('Could not fetch project/coordinator details for invite email');
    }

    // Send invite email via Resend HTTP API
    let emailSent = false;
    let emailError = null;
    try {
      await sendEmail({
        to: email,
        subject: `You've been invited to join ${projectName} on TrackMyScaffolding`,
        html: buildInviteEmail({ inviteUrl, projectName, coordinatorName }),
      });
      emailSent = true;
    } catch (err) {
      emailError = err?.response?.data || err?.message || 'Unknown email error';
      logger.error(`Failed to send invite email to ${email}:`, emailError);
    }

    logger.info(`Created invite for ${email} on project ${projectId} — email sent: ${emailSent}`);

    res.json({
      success: true,
      message: 'Invitation created successfully',
      inviteUrl,
      emailSent,
      emailError: emailSent ? undefined : emailError,
    });
  } catch (err) {
    logger.error('Invite error:', err?.message || err);
    next(err);
  }
});

// GET /qr-code - Generate QR code for a given URL
router.get('/qr-code', authMiddleware, async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    throw new Error('URL parameter is required');
  }

  const qrCodeDataUrl = await QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });

  res.json({ qrCode: qrCodeDataUrl });
});

// GET /validate-token/:token - Public endpoint to validate invite
router.get('/validate-token/:token', async (req, res, next) => {
  const { token } = req.params;

  try {
    const record = await pb.collection('site_team_invites').getFirstListItem(`inviteToken="${token}"`);

    if (new Date(record.inviteTokenExpiry) < new Date()) {
      return res.status(400).json({ valid: false, error: 'Token has expired' });
    }

    if (record.status !== 'pending_invite') {
      return res.status(400).json({ valid: false, error: 'Invitation has already been used or revoked' });
    }

    // Fetch project and coordinator separately (fields are text, not relations)
    let project = { name: 'Unknown Project' };
    let coordinator = { full_name: 'Project Coordinator' };
    try {
      const proj = await pb.collection('projects').getOne(record.projectId);
      project = { id: proj.id, name: proj.name };
    } catch {}
    try {
      const coord = await pb.collection('users').getOne(record.createdBy);
      coordinator = { id: coord.id, full_name: coord.full_name || coord.name };
    } catch {}

    res.json({
      valid: true,
      email: record.email,
      role: record.role,
      permissions: record.permissions,
      project,
      coordinator,
    });
  } catch (error) {
    res.status(400).json({ valid: false, error: 'Invite link is invalid or has expired' });
  }
});

// POST /join - Public endpoint to accept invite and create user
router.post('/join', async (req, res, next) => {
  try {
    const { token, full_name, password } = req.body;

    if (!token || !full_name || !password) {
      return res.status(400).json({ error: 'Token, full name, and password are required' });
    }

    // 1. Validate token
    const subRecord = await pb.collection('site_team_invites').getFirstListItem(`inviteToken="${token}"`);

    if (!subRecord || new Date(subRecord.inviteTokenExpiry) < new Date() || subRecord.status !== 'pending_invite') {
      return res.status(400).json({ error: 'Invalid or expired invitation' });
    }

    // 2. Check if user already exists with this email
    let userId;
    try {
      const existingUser = await pb.collection('users').getFirstListItem(`email="${subRecord.email}"`);
      userId = existingUser.id;
      await pb.collection('users').update(userId, { full_name });
    } catch (e) {
      // User doesn't exist, create new
      const newUser = await pb.collection('users').create({
        email: subRecord.email,
        password: password,
        passwordConfirm: password,
        full_name,
        name: full_name,
        role: 'Site Team',
        plan: 'free',
        language: 'EN',
        unsubscribeToken: crypto.randomBytes(16).toString('hex'),
        emailVisibility: true,
        verified: true,
      });
      userId = newUser.id;
    }

    // 3. Update site team invite record
    await pb.collection('site_team_invites').update(subRecord.id, {
      userId: userId,
      status: 'active',
      inviteToken: '',
      joinedAt: new Date().toISOString()
    });

    logger.info(`User ${userId} joined project via invite token`);

    res.json({ success: true, message: 'Successfully joined the project' });
  } catch (err) {
    logger.error('Join error:', err?.message || err);
    next(err);
  }
});

export default router;
