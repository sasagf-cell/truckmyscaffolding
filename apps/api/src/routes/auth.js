import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import { hashPassword } from '../utils/password.js';
import { generateToken, generateResetToken, verifyResetToken } from '../utils/jwt.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /auth/register
router.post('/register', async (req, res) => {
  const { email, password, full_name, company_name, vat_number, role, language } = req.body;

  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Email, password, and full_name are required' });
  }

  try {
    // Check if user already exists
    const existingUsers = await pb.collection('users').getFullList({
      filter: `email = "${email}"`,
    });

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await pb.collection('users').create({
      email,
      password: hashedPassword,
      passwordConfirm: hashedPassword,
      full_name,
      company_name: company_name || '',
      vat_number: vat_number || '',
      role: role || 'user',
      language: language || 'en',
      plan: 'free',
    });

    const token = generateToken(user);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        plan: user.plan,
      },
      token,
    });
  } catch (error) {
    logger.error('Registration error:', error.message);
    throw error;
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const authData = await pb.collection('users').authWithPassword(email, password);

    const token = generateToken(authData.record);

    res.json({
      user: {
        id: authData.record.id,
        email: authData.record.email,
        full_name: authData.record.full_name,
        role: authData.record.role,
        plan: authData.record.plan,
      },
      token,
    });
  } catch (error) {
    logger.error('Login error:', error.message);
    if (error.status === 401) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    throw error;
  }
});

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const users = await pb.collection('users').getFullList({
      filter: `email = "${email}"`,
    });

    if (users.length === 0) {
      // Return success even if user doesn't exist (security best practice)
      return res.json({ message: 'If email exists, reset link has been sent' });
    }

    const user = users[0];
    const resetToken = generateResetToken(user.id);

    // Store reset token in user record
    await pb.collection('users').update(user.id, {
      reset_token: resetToken,
      reset_token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    // TODO: Send email with reset link
    // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // await sendEmail(email, 'Password Reset', `Click here to reset: ${resetLink}`);

    logger.info(`Password reset token generated for user: ${user.id}`);

    res.json({ message: 'If email exists, reset link has been sent' });
  } catch (error) {
    logger.error('Forgot password error:', error.message);
    throw error;
  }
});

// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, new_password } = req.body;

  if (!token || !new_password) {
    return res.status(400).json({ error: 'Token and new_password are required' });
  }

  try {
    const decoded = verifyResetToken(token);
    const userId = decoded.userId;

    const user = await pb.collection('users').getOne(userId);

    if (!user.reset_token || user.reset_token !== token) {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    if (new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    const hashedPassword = await hashPassword(new_password);

    await pb.collection('users').update(userId, {
      password: hashedPassword,
      passwordConfirm: hashedPassword,
      reset_token: '',
      reset_token_expires: null,
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    logger.error('Reset password error:', error.message);
    if (error.message.includes('Invalid or expired reset token')) {
      return res.status(400).json({ error: error.message });
    }
    throw error;
  }
});

export default router;
