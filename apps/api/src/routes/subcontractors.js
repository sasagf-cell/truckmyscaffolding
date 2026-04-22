
import express from 'express';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { authMiddleware } from '../middleware/auth.js';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /invite - Generate invite token and create record
router.post('/invite', authMiddleware, async (req, res) => {
  const { projectId, email, role, permissions, message } = req.body;

  if (!projectId || !email || !role) {
    throw new Error('projectId, email, and role are required');
  }

  const inviteToken = crypto.randomBytes(32).toString('hex');
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30); // 30 days expiry

  // Create the subcontractor record. The PocketBase hook will handle the email.
  const record = await pb.collection('subcontractors').create({
    projectId,
    email,
    role,
    status: 'pending_invite',
    permissions: permissions || [],
    inviteToken,
    inviteTokenExpiry: expiryDate.toISOString(),
    createdBy: req.user.id
  });

  logger.info(`Created invite for ${email} on project ${projectId}`);

  res.json({ 
    success: true, 
    message: 'Invitation created successfully',
    inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join?token=${inviteToken}`
  });
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
router.get('/validate-token/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const record = await pb.collection('subcontractors').getFirstListItem(`inviteToken="${token}"`, {
      expand: 'projectId,createdBy'
    });

    if (!record) {
      throw new Error('Invalid token');
    }

    if (new Date(record.inviteTokenExpiry) < new Date()) {
      throw new Error('Token has expired');
    }

    if (record.status !== 'pending_invite') {
      throw new Error('Invitation has already been used or revoked');
    }

    res.json({
      valid: true,
      email: record.email,
      role: record.role,
      permissions: record.permissions,
      project: record.expand?.projectId || { name: 'Unknown Project' },
      coordinator: record.expand?.createdBy || { full_name: 'Project Coordinator' }
    });
  } catch (error) {
    res.status(400).json({ valid: false, error: 'Invite link is invalid or has expired' });
  }
});

// POST /join - Public endpoint to accept invite and create user
router.post('/join', async (req, res) => {
  const { token, full_name, password } = req.body;

  if (!token || !full_name || !password) {
    throw new Error('Token, full name, and password are required');
  }

  // 1. Validate token
  const subRecord = await pb.collection('subcontractors').getFirstListItem(`inviteToken="${token}"`);
  
  if (!subRecord || new Date(subRecord.inviteTokenExpiry) < new Date() || subRecord.status !== 'pending_invite') {
    throw new Error('Invalid or expired invitation');
  }

  // 2. Check if user already exists with this email
  let userId;
  try {
    const existingUser = await pb.collection('users').getFirstListItem(`email="${subRecord.email}"`);
    userId = existingUser.id;
    // Update existing user's name if provided
    await pb.collection('users').update(userId, { full_name });
  } catch (e) {
    // User doesn't exist, create new
    const newUser = await pb.collection('users').create({
      email: subRecord.email,
      password: password,
      passwordConfirm: password,
      full_name,
      role: 'Subcontractor',
      emailVisibility: true
    });
    userId = newUser.id;
  }

  // 3. Update subcontractor record
  await pb.collection('subcontractors').update(subRecord.id, {
    userId: userId,
    status: 'active',
    inviteToken: '', // Clear token
    joinedAt: new Date().toISOString()
  });

  logger.info(`User ${userId} joined project via invite token`);

  res.json({ success: true, message: 'Successfully joined the project' });
});

export default router;
