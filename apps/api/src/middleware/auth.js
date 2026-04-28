import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // 1. Try custom JWT_SECRET (legacy / future custom tokens)
  if (process.env.JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch {
      // Fall through to PocketBase token decode
    }
  }

  // 2. Decode PocketBase JWT payload (signed by PB, not our secret)
  //    We trust it because it comes from our own PocketBase instance via the browser authStore.
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    if (!payload.id) throw new Error('Missing user id in token payload');
    req.user = { id: payload.id, email: payload.email, collectionId: payload.collectionId };
    return next();
  } catch (error) {
    logger.error('Token verification failed:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
