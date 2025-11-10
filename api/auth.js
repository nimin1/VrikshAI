/**
 * Authentication API Endpoint - Node.js Serverless
 *
 * User signup, login, token refresh, and token verification.
 * Uses Supabase Auth + custom JWT tokens.
 */

import { getDatabase } from './_utils/database.js';
import { generateToken, verifyToken } from './_utils/auth_middleware.js';

/**
 * Send JSON response with proper CORS headers.
 */
function sendResponse(res, status, data) {
  res.status(status).json(data);
}

/**
 * Handle CORS preflight requests.
 */
function handleCORS(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Handle user signup.
 *
 * Request body:
 *   {
 *     "email": "user@example.com",
 *     "password": "securepassword",
 *     "name": "John Doe"
 *   }
 *
 * Response:
 *   {
 *     "success": true,
 *     "token": "jwt-token",
 *     "user": {
 *       "id": "uuid",
 *       "email": "user@example.com",
 *       "name": "John Doe"
 *     }
 *   }
 */
async function handleSignup(req, res) {
  try {
    const { email, password, name } = req.body;

    // Validate required fields
    const emailTrimmed = (email || '').trim().toLowerCase();
    const nameTrimmed = (name || '').trim();

    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      return sendResponse(res, 400, {
        success: false,
        error: 'Valid email is required'
      });
    }

    if (!password || password.length < 6) {
      return sendResponse(res, 400, {
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    if (!nameTrimmed) {
      return sendResponse(res, 400, {
        success: false,
        error: 'Name is required'
      });
    }

    console.log(`Signup attempt for ${emailTrimmed}`);

    // Get database connection
    const db = getDatabase();

    // Create user with Supabase Auth
    // Include name in user_metadata so the trigger can use it
    let userId;
    try {
      const { data: authData, error: authError } = await db.client.auth.signUp({
        email: emailTrimmed,
        password: password,
        options: {
          data: {
            name: nameTrimmed
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      userId = authData.user.id;
    } catch (error) {
      const errorMsg = error.message.toLowerCase();
      if (errorMsg.includes('already') || errorMsg.includes('exists')) {
        return sendResponse(res, 409, {
          success: false,
          error: 'Email already registered. Please login instead.'
        });
      }
      throw error;
    }

    // User record in users table is automatically created by database trigger
    // See: backend/schema.sql - handle_new_user() function and on_auth_user_created trigger
    console.log('User record will be created automatically by database trigger');

    // Generate JWT token
    const token = generateToken(userId, emailTrimmed);

    sendResponse(res, 200, {
      success: true,
      token: token,
      user: {
        id: userId,
        email: emailTrimmed,
        name: nameTrimmed
      }
    });

    console.log(`User ${emailTrimmed} signed up successfully`);
  } catch (error) {
    console.error('Signup failed:', error.message);
    sendResponse(res, 500, {
      success: false,
      error: 'Signup failed. Please try again.'
    });
  }
}

/**
 * Handle user login.
 *
 * Request body:
 *   {
 *     "email": "user@example.com",
 *     "password": "securepassword"
 *   }
 *
 * Response:
 *   {
 *     "success": true,
 *     "token": "jwt-token",
 *     "user": {
 *       "id": "uuid",
 *       "email": "user@example.com",
 *       "name": "John Doe"
 *     }
 *   }
 */
async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    const emailTrimmed = (email || '').trim().toLowerCase();

    if (!emailTrimmed || !password) {
      return sendResponse(res, 400, {
        success: false,
        error: 'Email and password are required'
      });
    }

    console.log(`Login attempt for ${emailTrimmed}`);

    // Get database connection
    const db = getDatabase();

    // Authenticate with Supabase
    let userId;
    try {
      const { data: authData, error: authError } = await db.client.auth.signInWithPassword({
        email: emailTrimmed,
        password: password
      });

      if (authError) throw authError;
      if (!authData.user) {
        throw new Error('Invalid credentials');
      }

      userId = authData.user.id;
    } catch (error) {
      console.error(`Login failed for ${emailTrimmed}:`, error.message);
      return sendResponse(res, 401, {
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Get user details from database
    const userData = await db.getUser(userId);
    const userName = userData ? userData.name : 'User';

    // Generate JWT token
    const token = generateToken(userId, emailTrimmed);

    sendResponse(res, 200, {
      success: true,
      token: token,
      user: {
        id: userId,
        email: emailTrimmed,
        name: userName
      }
    });

    console.log(`User ${emailTrimmed} logged in successfully`);
  } catch (error) {
    console.error('Login failed:', error.message);
    sendResponse(res, 500, {
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
}

/**
 * Handle token refresh.
 *
 * Request headers:
 *   Authorization: Bearer <current-token>
 *
 * Response:
 *   {
 *     "success": true,
 *     "token": "new-jwt-token"
 *   }
 */
async function handleRefresh(req, res) {
  try {
    // Verify current token
    let authData;
    try {
      authData = verifyToken(req);
    } catch (error) {
      console.error('Token refresh failed:', error.message);
      return sendResponse(res, 401, {
        success: false,
        error: error.message
      });
    }

    // Generate new token
    const token = generateToken(authData.user_id, authData.email);

    sendResponse(res, 200, {
      success: true,
      token: token
    });

    console.log(`Token refreshed for user ${authData.user_id}`);
  } catch (error) {
    console.error('Token refresh failed:', error.message);
    sendResponse(res, 500, {
      success: false,
      error: 'Token refresh failed. Please login again.'
    });
  }
}

/**
 * Handle token verification.
 *
 * Request headers:
 *   Authorization: Bearer <token>
 *
 * Response:
 *   {
 *     "success": true,
 *     "user": {
 *       "id": "uuid",
 *       "email": "user@example.com",
 *       "name": "John Doe"
 *     }
 *   }
 */
async function handleVerify(req, res) {
  try {
    // Verify token
    let authData;
    try {
      authData = verifyToken(req);
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return sendResponse(res, 401, {
        success: false,
        error: error.message
      });
    }

    // Get database connection
    const db = getDatabase();

    // Get user details from database
    const userData = await db.getUser(authData.user_id);

    if (!userData) {
      return sendResponse(res, 404, {
        success: false,
        error: 'User not found'
      });
    }

    sendResponse(res, 200, {
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name
      }
    });

    console.log(`Token verified for user ${authData.user_id}`);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    sendResponse(res, 500, {
      success: false,
      error: 'Token verification failed'
    });
  }
}

/**
 * Main handler function for Vercel serverless deployment.
 *
 * Routes:
 *   POST /api/auth/signup - Create user account
 *   POST /api/auth/login - Login user
 *   POST /api/auth/refresh - Refresh JWT token
 *   GET /api/auth/verify - Verify JWT token
 */
export default async function handler(req, res) {
  // Handle CORS
  if (handleCORS(req, res)) {
    return;
  }

  const path = req.url.toLowerCase();

  // GET routes
  if (req.method === 'GET') {
    if (path.includes('/verify')) {
      return handleVerify(req, res);
    } else {
      return sendResponse(res, 404, {
        success: false,
        error: 'Invalid auth endpoint. Use /verify'
      });
    }
  }

  // POST routes
  if (req.method === 'POST') {
    if (path.includes('/signup')) {
      return handleSignup(req, res);
    } else if (path.includes('/login')) {
      return handleLogin(req, res);
    } else if (path.includes('/refresh')) {
      return handleRefresh(req, res);
    } else {
      return sendResponse(res, 404, {
        success: false,
        error: 'Invalid auth endpoint. Use /signup, /login, or /refresh'
      });
    }
  }

  // Method not allowed
  return sendResponse(res, 405, {
    success: false,
    error: 'Method not allowed'
  });
}
