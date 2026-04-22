import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
};

export const generateResetToken = (userId) => {
  return jwt.sign(
    { userId, type: 'reset' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.RESET_TOKEN_EXPIRY || '24h' }
  );
};

export const verifyResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'reset') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired reset token');
  }
};
