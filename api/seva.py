"""
Seva (सेवा - Service) API Endpoint.

Personalized plant care schedule generation using GPT-5.
Public endpoint - no authentication required.
"""

import json
import asyncio
import logging
from http.server import BaseHTTPRequestHandler
from typing import Dict, Any

from _utils.vriksh_ai_service import get_vriksh_ai_service

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
    """Vercel serverless handler for Seva endpoint."""

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_POST(self):
        """
        Generate personalized care schedule for a plant.

        Request body:
            {
                "plant_name": "Monstera Deliciosa",
                "location": "Mumbai, India" (optional, default: "General"),
                "season": "Spring" (optional, default: "Spring"),
                "indoor": true (optional, default: true)
            }

        Response:
            {
                "success": true,
                "seva": {
                    "watering": {...},
                    "light": {...},
                    "fertilizing": {...},
                    "maintenance": {...},
                    "seasonal_tips": [...],
                    "vaidya_wisdom": "..."
                }
            }
        """
        try:
            # Parse request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)

            # Validate required fields
            plant_name = data.get('plant_name')
            if not plant_name:
                send_response(self, 400, {
                    'success': False,
                    'error': 'plant_name is required'
                })
                return

            # Extract optional parameters with defaults
            location = data.get('location', 'General')
            season = data.get('season', 'Spring')
            indoor = data.get('indoor', True)

            logger.info(f"Seva Schedule request for {plant_name}")

            # Get AI service and generate schedule
            ai_service = get_vriksh_ai_service()
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(
                ai_service.seva_schedule(plant_name, location, season, indoor)
            )
            loop.close()

            # Convert Pydantic model to dict
            seva_data = result.model_dump()

            send_response(self, 200, {
                'success': True,
                'seva': seva_data
            })

            logger.info(f"Seva Schedule successful for {plant_name}")

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
            logger.error(f"Seva Schedule failed: {str(e)}")
            send_response(self, 500, {
                'success': False,
                'error': 'Care schedule generation failed. Please try again.'
            })
