import express from 'express';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authMiddleware } from '../middleware/auth.js';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { hashPassword } from '../utils/password.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PATCH /users/profile - Update user profile
router.patch('/profile', authMiddleware, async (req, res) => {
  const { fullName, phone, company } = req.body;
  const userId = req.user.id;

  const updateData = {};
  if (fullName !== undefined) updateData.full_name = fullName;
  if (phone !== undefined) updateData.phone = phone;
  if (company !== undefined) updateData.company_name = company;

  const updatedUser = await pb.collection('users').update(userId, updateData);

  res.json({
    success: true,
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      full_name: updatedUser.full_name,
      phone: updatedUser.phone,
      company_name: updatedUser.company_name,
      role: updatedUser.role,
    },
  });
});

// PATCH /users/avatar - Upload user avatar
router.patch('/avatar', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const formData = new FormData();
  formData.append('avatar', fs.createReadStream(req.file.path));

  const updatedUser = await pb.collection('users').update(userId, formData);

  const avatarUrl = pb.files.getURL(updatedUser, updatedUser.avatar);

  res.json({
    success: true,
    avatarUrl,
  });
});

// PATCH /users/notifications - Update notification preferences
router.patch('/notifications', authMiddleware, async (req, res) => {
  const { notificationPreferences } = req.body;
  const userId = req.user.id;

  if (!notificationPreferences || typeof notificationPreferences !== 'object') {
    return res.status(400).json({ error: 'notificationPreferences must be an object' });
  }

  const updatedUser = await pb.collection('users').update(userId, {
    notification_preferences: notificationPreferences,
  });

  res.json({
    success: true,
    preferences: updatedUser.notification_preferences,
  });
});

// POST /users/change-password - Change user password
router.post('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword are required' });
  }

  const user = await pb.collection('users').getOne(userId);

  try {
    await pb.collection('users').authWithPassword(user.email, currentPassword);
  } catch (error) {
    throw new Error('Current password is incorrect');
  }

  const hashedPassword = await hashPassword(newPassword);

  await pb.collection('users').update(userId, {
    password: hashedPassword,
    passwordConfirm: hashedPassword,
  });

  res.json({
    success: true,
    message: 'Password updated',
  });
});

// GET /users/login-history - Get user login history
router.get('/login-history', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  const loginHistory = await pb.collection('loginHistory').getList(1, 50, {
    filter: `userId="${userId}"`,
    sort: '-timestamp',
  });

  res.json(loginHistory.items);
});

// POST /users/enable-2fa - Enable 2FA
router.post('/enable-2fa', authMiddleware, async (req, res) => {
  const speakeasy = await import('speakeasy');
  const qrcode = await import('qrcode');

  const userId = req.user.id;
  const user = await pb.collection('users').getOne(userId);

  const secret = speakeasy.generateSecret({
    name: `TrackMyScaffolding (${user.email})`,
    issuer: 'TrackMyScaffolding',
    length: 32,
  });

  const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

  // Store secret temporarily in user record (not yet confirmed)
  await pb.collection('users').update(userId, {
    twoFactorSecret: secret.base32,
    twoFactorEnabled: false,
  });

  res.json({
    qrCode: qrCodeDataUrl,
    secret: secret.base32,
  });
});

// POST /users/confirm-2fa - Confirm 2FA setup
router.post('/confirm-2fa', authMiddleware, async (req, res) => {
  const { verificationCode } = req.body;
  const speakeasy = await import('speakeasy');

  if (!verificationCode) {
    return res.status(400).json({ error: 'verificationCode is required' });
  }

  const userId = req.user.id;
  const user = await pb.collection('users').getOne(userId);

  if (!user.twoFactorSecret) {
    throw new Error('2FA setup not initiated. Call /enable-2fa first');
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: verificationCode,
    window: 2,
  });

  if (!verified) {
    throw new Error('Invalid verification code');
  }

  await pb.collection('users').update(userId, {
    twoFactorEnabled: true,
  });

  res.json({
    success: true,
    message: '2FA enabled',
  });
});

// POST /users/disable-2fa - Disable 2FA
router.post('/disable-2fa', authMiddleware, async (req, res) => {
  const { password } = req.body;
  const userId = req.user.id;

  if (!password) {
    return res.status(400).json({ error: 'password is required' });
  }

  const user = await pb.collection('users').getOne(userId);

  try {
    await pb.collection('users').authWithPassword(user.email, password);
  } catch (error) {
    throw new Error('Password is incorrect');
  }

  await pb.collection('users').update(userId, {
    twoFactorEnabled: false,
    twoFactorSecret: '',
  });

  res.json({
    success: true,
    message: '2FA disabled',
  });
});

export default router;
