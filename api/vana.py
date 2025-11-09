"""
Mera Vana (मेरा वन - My Garden) API Endpoint.

Plant collection CRUD operations.
Requires authentication for all operations.
"""

import json
import logging
from http.server import BaseHTTPRequestHandler
from typing import Dict, Any
from urllib.parse import urlparse, parse_qs

from _utils.database import get_database
from _utils.auth_middleware import verify_token

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def send_response(handler: BaseHTTPRequestHandler, status: int, data: Dict[str, Any]) -> None:
    """Send JSON response with proper headers."""
    handler.send_response(status)
    handler.send_header('Content-Type', 'application/json')
    handler.send_header('Access-Control-Allow-Origin', '*')
    handler.send_header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
    handler.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    handler.end_headers()
    handler.wfile.write(json.dumps(data).encode())


class handler(BaseHTTPRequestHandler):
    """Vercel serverless handler for Mera Vana endpoint."""

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        """
        Get all plants in user's Mera Vana collection.

        Request headers:
            Authorization: Bearer <token>

        Response:
            {
                "success": true,
                "vana": [...],
                "count": 5
            }
        """
        try:
            # Verify authentication
            try:
                auth_data = verify_token(self)
                user_id = auth_data['user_id']
            except Exception as e:
                logger.warning(f"Authentication failed: {str(e)}")
                send_response(self, 401, {
                    'success': False,
                    'error': str(e)
                })
                return

            # Get plants from database
            db = get_database()
            plants = db.get_mera_vana(user_id)

            send_response(self, 200, {
                'success': True,
                'vana': plants,
                'count': len(plants)
            })

            logger.info(f"Retrieved {len(plants)} plants for user {user_id}")

        except Exception as e:
            logger.error(f"Failed to fetch Mera Vana: {str(e)}")
            send_response(self, 500, {
                'success': False,
                'error': 'Failed to fetch plants. Please try again.'
            })

    def do_POST(self):
        """
        Add a new plant to Mera Vana.

        Request headers:
            Authorization: Bearer <token>

        Request body:
            {
                "name": "My Monstera",
                "species": "Monstera Deliciosa",
                "scientific_name": "Monstera deliciosa",
                "sanskrit_name": null,
                "family": "Araceae",
                "image_url": "https://...",
                "care_schedule": {...},
                "notes": "Birthday gift from Mom"
            }

        Response:
            {
                "success": true,
                "plant_id": "uuid",
                "message": "Plant added to Mera Vana successfully"
            }
        """
        try:
            # Verify authentication
            try:
                auth_data = verify_token(self)
                user_id = auth_data['user_id']
            except Exception as e:
                logger.warning(f"Authentication failed: {str(e)}")
                send_response(self, 401, {
                    'success': False,
                    'error': str(e)
                })
                return

            # Parse request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            plant_data = json.loads(body)

            # Validate required fields
            if not plant_data.get('name'):
                send_response(self, 400, {
                    'success': False,
                    'error': 'Plant name is required'
                })
                return

            if not plant_data.get('species'):
                send_response(self, 400, {
                    'success': False,
                    'error': 'Plant species is required'
                })
                return

            # Save to database
            db = get_database()
            plant_id = db.save_to_vana(user_id, plant_data)

            send_response(self, 200, {
                'success': True,
                'plant_id': plant_id,
                'message': 'Plant added to Mera Vana successfully'
            })

            logger.info(f"Plant {plant_id} added to Vana for user {user_id}")

        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            send_response(self, 400, {
                'success': False,
                'error': 'Invalid JSON in request body'
            })

        except Exception as e:
            logger.error(f"Failed to add plant: {str(e)}")
            send_response(self, 500, {
                'success': False,
                'error': 'Failed to add plant. Please try again.'
            })

    def do_PATCH(self):
        """
        Update a plant in Mera Vana.

        Request headers:
            Authorization: Bearer <token>

        Request body:
            {
                "plant_id": "uuid",
                "last_watered": "2025-11-01T10:30:00Z",
                "watering_frequency_days": 7,
                "notes": "Looking healthier!",
                "health_status": "healthy"
            }

        Response:
            {
                "success": true,
                "message": "Plant updated successfully"
            }
        """
        try:
            # Verify authentication
            try:
                auth_data = verify_token(self)
                user_id = auth_data['user_id']
            except Exception as e:
                logger.warning(f"Authentication failed: {str(e)}")
                send_response(self, 401, {
                    'success': False,
                    'error': str(e)
                })
                return

            # Parse request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)

            plant_id = data.get('plant_id')
            if not plant_id:
                send_response(self, 400, {
                    'success': False,
                    'error': 'plant_id is required'
                })
                return

            # Remove plant_id from updates
            updates = {k: v for k, v in data.items() if k != 'plant_id'}

            if not updates:
                send_response(self, 400, {
                    'success': False,
                    'error': 'No fields to update'
                })
                return

            # Update in database
            db = get_database()
            db.update_vana_plant(plant_id, user_id, updates)

            send_response(self, 200, {
                'success': True,
                'message': 'Plant updated successfully'
            })

            logger.info(f"Plant {plant_id} updated by user {user_id}")

        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            send_response(self, 400, {
                'success': False,
                'error': 'Invalid JSON in request body'
            })

        except Exception as e:
            logger.error(f"Failed to update plant: {str(e)}")
            send_response(self, 500, {
                'success': False,
                'error': str(e)
            })

    def do_DELETE(self):
        """
        Delete a plant from Mera Vana.

        Request headers:
            Authorization: Bearer <token>

        Query parameters:
            plant_id: UUID of the plant to delete

        Response:
            {
                "success": true,
                "message": "Plant removed from Mera Vana successfully"
            }
        """
        try:
            # Verify authentication
            try:
                auth_data = verify_token(self)
                user_id = auth_data['user_id']
            except Exception as e:
                logger.warning(f"Authentication failed: {str(e)}")
                send_response(self, 401, {
                    'success': False,
                    'error': str(e)
                })
                return

            # Extract plant_id from query parameters
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            plant_id = query_params.get('plant_id', [None])[0]

            if not plant_id:
                send_response(self, 400, {
                    'success': False,
                    'error': 'plant_id query parameter is required'
                })
                return

            # Delete from database
            db = get_database()
            db.remove_from_vana(plant_id, user_id)

            send_response(self, 200, {
                'success': True,
                'message': 'Plant removed from Mera Vana successfully'
            })

            logger.info(f"Plant {plant_id} removed by user {user_id}")

        except Exception as e:
            logger.error(f"Failed to delete plant: {str(e)}")
            send_response(self, 500, {
                'success': False,
                'error': str(e)
            })
