"""
AI Darshan (दर्शन - Vision) API Endpoint.

Plant identification from images using GPT-5 vision with Pydantic AI.
Public endpoint - no authentication required.
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
    """Vercel serverless handler for AI Darshan endpoint."""

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_POST(self):
        """
        Identify plant from image.

        Request body:
            {
                "image_url": "https://..." OR "image_base64": "data:image/jpeg;base64,..."
            }

        Response:
            {
                "success": true,
                "darshan": {
                    "common_name": "Monstera Deliciosa",
                    "scientific_name": "Monstera deliciosa",
                    "sanskrit_name": null,
                    "family": "Araceae",
                    "confidence": 0.95,
                    "care_summary": {...},
                    "traditional_use": null,
                    "fun_fact": "..."
                }
            }
        """
        try:
            # Parse request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)

            # Extract image URL or convert base64
            image_url = data.get('image_url')
            image_base64 = data.get('image_base64')

            if not image_url and not image_base64:
                send_response(self, 400, {
                    'success': False,
                    'error': 'Either image_url or image_base64 is required'
                })
                return

            # Use base64 data URL if provided
            if image_base64 and not image_url:
                # Ensure it's a proper data URL
                if not image_base64.startswith('data:'):
                    image_url = f"data:image/jpeg;base64,{image_base64}"
                else:
                    image_url = image_base64

            logger.info("AI Darshan request received")

            # Get AI service and perform identification
            ai_service = get_vriksh_ai_service()
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(ai_service.ai_darshan(image_url))
            loop.close()

            # Convert Pydantic model to dict
            darshan_data = result.model_dump()

            send_response(self, 200, {
                'success': True,
                'darshan': darshan_data
            })

            logger.info(f"AI Darshan successful: {result.common_name}")

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
            logger.error(f"AI Darshan failed: {str(e)}")
            send_response(self, 500, {
                'success': False,
                'error': 'Plant identification failed. Please try again with a clearer image.'
            })
