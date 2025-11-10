/**
 * Mera Vana (मेरा वन - My Garden) API Endpoint - Node.js Serverless
 *
 * Plant collection CRUD operations.
 * Requires authentication for all operations.
 */

import { getDatabase } from './_utils/database.js';
import { verifyToken } from './_utils/auth_middleware.js';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Authenticate request and return user_id.
 *
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @returns {string|null} user_id if authenticated, null if failed (response already sent)
 */
function authenticate(req, res) {
  try {
    const authData = verifyToken(req);
    return authData.user_id;
  } catch (error) {
    console.error('Authentication failed:', error.message);
    sendResponse(res, 401, {
      success: false,
      error: error.message
    });
    return null;
  }
}

/**
 * Extract plant ID from URL path.
 *
 * @param {string} path - URL path
 * @returns {string|null} plant_id or null
 */
function extractPlantId(path) {
  // Match pattern: /api/vana/{plant_id}
  const match = path.match(/\/api\/vana\/([a-f0-9-]+)/i);
  return match ? match[1] : null;
}

/**
 * Handle GET requests - List plants or get specific plant.
 *
 * GET /api/vana - List all user's plants
 * GET /api/vana/:id - Get specific plant
 *
 * Response:
 *   {
 *     "success": true,
 *     "vana": [...],
 *     "count": 5
 *   }
 */
async function handleGet(req, res) {
  try {
    // Authenticate
    const userId = authenticate(req, res);
    if (!userId) return;

    const plantId = extractPlantId(req.url);

    // Get database connection
    const db = getDatabase();

    if (plantId) {
      // Get specific plant
      const plants = await db.getMeraVana(userId);
      const plant = plants.find(p => p.id === plantId);

      if (!plant) {
        return sendResponse(res, 404, {
          success: false,
          error: 'Plant not found'
        });
      }

      sendResponse(res, 200, {
        success: true,
        plant: plant
      });

      console.log(`Retrieved plant ${plantId} for user ${userId}`);
    } else {
      // Get all plants
      const plants = await db.getMeraVana(userId);

      sendResponse(res, 200, {
        success: true,
        vana: plants,
        count: plants.length
      });

      console.log(`Retrieved ${plants.length} plants for user ${userId}`);
    }
  } catch (error) {
    console.error('Failed to fetch Mera Vana:', error.message);
    sendResponse(res, 500, {
      success: false,
      error: 'Failed to fetch plants. Please try again.'
    });
  }
}

/**
 * Handle POST requests - Add new plant.
 *
 * Request body:
 *   {
 *     "name": "My Monstera",
 *     "species": "Monstera Deliciosa",
 *     "scientific_name": "Monstera deliciosa",
 *     "sanskrit_name": null,
 *     "family": "Araceae",
 *     "image_url": "https://...",
 *     "care_schedule": {...},
 *     "notes": "Birthday gift from Mom"
 *   }
 *
 * Response:
 *   {
 *     "success": true,
 *     "plant_id": "uuid",
 *     "message": "Plant added to Mera Vana successfully"
 *   }
 */
async function handlePost(req, res) {
  try {
    // Authenticate
    const userId = authenticate(req, res);
    if (!userId) return;

    const plantData = req.body;

    // Validate required fields
    if (!plantData.name) {
      return sendResponse(res, 400, {
        success: false,
        error: 'Plant name is required'
      });
    }

    if (!plantData.species) {
      return sendResponse(res, 400, {
        success: false,
        error: 'Plant species is required'
      });
    }

    // Get database connection
    const db = getDatabase();

    // Save to database
    const plantId = await db.saveToVana(userId, plantData);

    sendResponse(res, 200, {
      success: true,
      plant_id: plantId,
      message: 'Plant added to Mera Vana successfully'
    });

    console.log(`Plant ${plantId} added to Vana for user ${userId}`);
  } catch (error) {
    console.error('Failed to add plant:', error.message);
    sendResponse(res, 500, {
      success: false,
      error: 'Failed to add plant. Please try again.'
    });
  }
}

/**
 * Handle PUT requests - Update plant.
 *
 * Request body:
 *   {
 *     "plant_id": "uuid",  // Can also be in URL path
 *     "last_watered": "2025-11-01T10:30:00Z",
 *     "watering_frequency_days": 7,
 *     "notes": "Looking healthier!",
 *     "health_status": "healthy"
 *   }
 *
 * Response:
 *   {
 *     "success": true,
 *     "message": "Plant updated successfully"
 *   }
 */
async function handlePut(req, res) {
  try {
    // Authenticate
    const userId = authenticate(req, res);
    if (!userId) return;

    const data = req.body;

    // Get plant_id from URL or body
    let plantId = extractPlantId(req.url) || data.plant_id;

    if (!plantId) {
      return sendResponse(res, 400, {
        success: false,
        error: 'plant_id is required'
      });
    }

    // Remove plant_id from updates
    const updates = { ...data };
    delete updates.plant_id;

    if (Object.keys(updates).length === 0) {
      return sendResponse(res, 400, {
        success: false,
        error: 'No fields to update'
      });
    }

    // Get database connection
    const db = getDatabase();

    // Update in database
    await db.updateVanaPlant(plantId, userId, updates);

    sendResponse(res, 200, {
      success: true,
      message: 'Plant updated successfully'
    });

    console.log(`Plant ${plantId} updated by user ${userId}`);
  } catch (error) {
    console.error('Failed to update plant:', error.message);
    sendResponse(res, 500, {
      success: false,
      error: error.message
    });
  }
}

/**
 * Handle DELETE requests - Remove plant.
 *
 * URL: /api/vana/:id or /api/vana?plant_id=uuid
 *
 * Response:
 *   {
 *     "success": true,
 *     "message": "Plant removed from Mera Vana successfully"
 *   }
 */
async function handleDelete(req, res) {
  try {
    // Authenticate
    const userId = authenticate(req, res);
    if (!userId) return;

    // Get plant_id from URL path or query parameter
    let plantId = extractPlantId(req.url);

    if (!plantId && req.query && req.query.plant_id) {
      plantId = req.query.plant_id;
    }

    if (!plantId) {
      return sendResponse(res, 400, {
        success: false,
        error: 'plant_id is required in URL path or query parameter'
      });
    }

    // Get database connection
    const db = getDatabase();

    // Delete from database
    await db.removeFromVana(plantId, userId);

    sendResponse(res, 200, {
      success: true,
      message: 'Plant removed from Mera Vana successfully'
    });

    console.log(`Plant ${plantId} removed by user ${userId}`);
  } catch (error) {
    console.error('Failed to delete plant:', error.message);
    sendResponse(res, 500, {
      success: false,
      error: error.message
    });
  }
}

/**
 * Main handler function for Vercel serverless deployment.
 *
 * Routes:
 *   GET /api/vana - List user's plants
 *   POST /api/vana - Add new plant
 *   GET /api/vana/:id - Get specific plant
 *   PUT /api/vana/:id - Update plant
 *   DELETE /api/vana/:id - Delete plant
 */
export default async function handler(req, res) {
  // Handle CORS
  if (handleCORS(req, res)) {
    return;
  }

  // Route based on HTTP method
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    case 'PUT':
    case 'PATCH':
      return handlePut(req, res);
    case 'DELETE':
      return handleDelete(req, res);
    default:
      return sendResponse(res, 405, {
        success: false,
        error: 'Method not allowed'
      });
  }
}
