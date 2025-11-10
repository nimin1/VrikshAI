/**
 * Authentication middleware for VrikshAI.
 *
 * Provides JWT token generation and verification for secure API access.
 */

import jwt from 'jsonwebtoken';

// Token expiration: 7 days
const TOKEN_EXPIRATION_DAYS = 7;

/**
 * Generate a JWT token for authenticated user.
 *
 * @param {string} userId - User's UUID
 * @param {string} email - User's email address
 * @returns {string} JWT token string
 * @throws {Error} If JWT_SECRET is not set
 */
export function generateToken(userId, email) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  const now = Math.floor(Date.now() / 1000);
  const expirationTime = now + (TOKEN_EXPIRATION_DAYS * 24 * 60 * 60);

  const payload = {
    user_id: userId,
    email: email,
    exp: expirationTime,
    iat: now
  };

  const token = jwt.sign(payload, secret, { algorithm: 'HS256' });
  console.log(`Token generated for user ${userId}`);
  return token;
}

/**
 * Verify JWT token from request Authorization header.
 *
 * @param {Object} req - HTTP request object with headers
 * @returns {Object} Object with user_id and email
 * @throws {Error} If token is missing, expired, or invalid
 */
export function verifyToken(req) {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    // Extract Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      throw new Error('Invalid Authorization header format. Use: Bearer <token>');
    }

    const token = parts[1];

    // Verify token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });

    console.log(`Token verified for user ${payload.user_id}`);
    return {
      user_id: payload.user_id,
      email: payload.email
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.error('Expired token attempt');
      throw new Error('Token has expired. Please login again.');
    } else if (error.name === 'JsonWebTokenError') {
      console.error('Invalid token attempt:', error.message);
      throw new Error('Invalid token. Please login again.');
    } else {
      console.error('Token verification failed:', error.message);
      throw error;
    }
  }
}
