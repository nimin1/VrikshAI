"""
AI Chikitsa (चिकित्सा - Healing) API Endpoint.

Plant health diagnosis and treatment recommendations using GPT-5.
Requires authentication.
"""

import json
import asyncio
import logging
import sys
import os
from http.server import BaseHTTPRequestHandler
from typing import Dict, Any

# Add api directory to path for Vercel serverless functions
sys.path.insert(0, os.path.dirname(__file__))

from _utils.vriksh_ai_service import get_vriksh_ai_service
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
    handler.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
    handler.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    handler.end_headers()
    handler.wfile.write(json.dumps(data).encode())


class handler(BaseHTTPRequestHandler):
    """Vercel serverless handler for AI Chikitsa endpoint."""

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_POST(self):
        """
        Diagnose plant health issues.

        Request headers:
            Authorization: Bearer <token>

        Request body:
            {
                "plant_name": "Monstera Deliciosa",
                "symptoms": "Yellowing leaves with brown spots",
                "image_url": "https://..." (optional),
                "plant_id": "uuid" (optional - for saving to history)
            }

        Response:
            {
                "success": true,
                "chikitsa": {
                    "diagnosis": "Overwatering with fungal infection",
                    "severity": "warning",
                    "confidence": 0.85,
                    "causes": [...],
                    "treatment": {...},
                    "prevention": [...],
                    "recovery_time": "2-3 weeks",
                    "warning_signs": [...],
                    "ayurvedic_wisdom": "..."
                },
                "saved": true
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

            # Validate required fields
            plant_name = data.get('plant_name')
            symptoms = data.get('symptoms')

            if not plant_name or not symptoms:
                send_response(self, 400, {
                    'success': False,
                    'error': 'plant_name and symptoms are required'
                })
                return

            image_url = data.get('image_url')
            plant_id = data.get('plant_id')

            logger.info(f"AI Chikitsa request for {plant_name} by user {user_id}")

            # Get AI service and perform diagnosis
            ai_service = get_vriksh_ai_service()
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(
                ai_service.ai_chikitsa(plant_name, symptoms, image_url)
            )
            loop.close()

            # Convert Pydantic model to dict
            chikitsa_data = result.model_dump()

            # Save to database if plant_id provided
            saved = False
            if plant_id:
                try:
                    db = get_database()
                    # Add image_url to diagnosis data
                    if image_url:
                        chikitsa_data['image_url'] = image_url
                    db.save_chikitsa_record(plant_id, chikitsa_data)

                    # Update plant health status based on severity
                    db.update_vana_plant(
                        plant_id,
                        user_id,
                        {'health_status': result.severity}
                    )
                    saved = True
                    logger.info(f"Diagnosis saved for plant {plant_id}")
                except Exception as e:
                    logger.warning(f"Failed to save diagnosis: {str(e)}")
                    # Continue even if save fails

            send_response(self, 200, {
                'success': True,
                'chikitsa': chikitsa_data,
                'saved': saved
            })

            logger.info(f"AI Chikitsa successful: {result.diagnosis}")

        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            send_response(self, 400, {
                'success': False,
                'error': 'Invalid JSON in request body'
            })

        except ValueError as e:
            logger.error(f"Validation error: {str(e)}")
            send_response(self, 400, {
                'success': False,
                'error': str(e)
            })

        except Exception as e:
            logger.error(f"AI Chikitsa failed: {str(e)}")
            send_response(self, 500, {
                'success': False,
                'error': 'Plant diagnosis failed. Please try again.'
            })
