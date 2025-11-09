"""
Authentication API Endpoint.

User signup, login, and token refresh.
"""

import json
import logging
import sys
import os
from http.server import BaseHTTPRequestHandler
from typing import Dict, Any

# Add api directory to path for Vercel serverless functions
sys.path.insert(0, os.path.dirname(__file__))

from _utils.database import get_database
from _utils.auth_middleware import generate_token, verify_token

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
    """Vercel serverless handler for authentication endpoint."""

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        """
        Handle GET authentication routes.

        Routes:
            GET /api/auth/verify - Verify JWT token
        """
        path = self.path.lower()

        if '/verify' in path:
            self._handle_verify()
        else:
            send_response(self, 404, {
                'success': False,
                'error': 'Invalid auth endpoint. Use /verify'
            })

    def do_POST(self):
        """
        Handle authentication routes based on path.

        Routes:
            POST /api/auth/signup - Create new user account
            POST /api/auth/login - Login existing user
            POST /api/auth/refresh - Refresh auth token
        """
        path = self.path.lower()

        if '/signup' in path:
            self._handle_signup()
        elif '/login' in path:
            self._handle_login()
        elif '/refresh' in path:
            self._handle_refresh()
        else:
            send_response(self, 404, {
                'success': False,
                'error': 'Invalid auth endpoint. Use /signup, /login, or /refresh'
            })

    def _handle_signup(self):
        """
        Create new user account.

        Request body:
            {
                "email": "user@example.com",
                "password": "securepassword",
                "name": "John Doe"
            }

        Response:
            {
                "success": true,
                "token": "jwt-token",
                "user": {
                    "id": "uuid",
                    "email": "user@example.com",
                    "name": "John Doe"
                }
            }
        """
        try:
            # Parse request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)

            # Validate required fields
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            name = data.get('name', '').strip()

            if not email or '@' not in email:
                send_response(self, 400, {
                    'success': False,
                    'error': 'Valid email is required'
                })
                return

            if not password or len(password) < 6:
                send_response(self, 400, {
                    'success': False,
                    'error': 'Password must be at least 6 characters'
                })
                return

            if not name:
                send_response(self, 400, {
                    'success': False,
                    'error': 'Name is required'
                })
                return

            logger.info(f"Signup attempt for {email}")

            # Get database connection
            db = get_database()

            # Create user with Supabase Auth
            # Include name in user_metadata so the trigger can use it
            try:
                auth_response = db.client.auth.sign_up({
                    'email': email,
                    'password': password,
                    'options': {
                        'data': {
                            'name': name
                        }
                    }
                })

                if not auth_response.user:
                    raise Exception("Failed to create user account")

                user_id = auth_response.user.id

            except Exception as e:
                error_msg = str(e).lower()
                if 'already' in error_msg or 'exists' in error_msg:
                    send_response(self, 409, {
                        'success': False,
                        'error': 'Email already registered. Please login instead.'
                    })
                    return
                raise

            # User record in users table is automatically created by database trigger
            # See: backend/schema.sql - handle_new_user() function and on_auth_user_created trigger
            logger.info(f"User record will be created automatically by database trigger")

            # Generate JWT token
            token = generate_token(user_id, email)

            send_response(self, 200, {
                'success': True,
                'token': token,
                'user': {
                    'id': user_id,
                    'email': email,
                    'name': name
                }
            })

            logger.info(f"User {email} signed up successfully")

        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            send_response(self, 400, {
                'success': False,
                'error': 'Invalid JSON in request body'
            })

        except Exception as e:
            logger.error(f"Signup failed: {str(e)}")
            send_response(self, 500, {
                'success': False,
                'error': 'Signup failed. Please try again.'
            })

    def _handle_login(self):
        """
        Login existing user.

        Request body:
            {
                "email": "user@example.com",
                "password": "securepassword"
            }

        Response:
            {
                "success": true,
                "token": "jwt-token",
                "user": {
                    "id": "uuid",
                    "email": "user@example.com",
                    "name": "John Doe"
                }
            }
        """
        try:
            # Parse request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)

            # Validate required fields
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')

            if not email or not password:
                send_response(self, 400, {
                    'success': False,
                    'error': 'Email and password are required'
                })
                return

            logger.info(f"Login attempt for {email}")

            # Get database connection
            db = get_database()

            # Authenticate with Supabase
            try:
                auth_response = db.client.auth.sign_in_with_password({
                    'email': email,
                    'password': password
                })

                if not auth_response.user:
                    raise Exception("Invalid credentials")

                user_id = auth_response.user.id

            except Exception as e:
                logger.warning(f"Login failed for {email}: {str(e)}")
                send_response(self, 401, {
                    'success': False,
                    'error': 'Invalid email or password'
                })
                return

            # Get user details from database
            user_data = db.get_user(user_id)
            name = user_data['name'] if user_data else 'User'

            # Generate JWT token
            token = generate_token(user_id, email)

            send_response(self, 200, {
                'success': True,
                'token': token,
                'user': {
                    'id': user_id,
                    'email': email,
                    'name': name
                }
            })

            logger.info(f"User {email} logged in successfully")

        except json.JSONDecodeError:
            logger.error("Invalid JSON in request body")
            send_response(self, 400, {
                'success': False,
                'error': 'Invalid JSON in request body'
            })

        except Exception as e:
            logger.error(f"Login failed: {str(e)}")
            send_response(self, 500, {
                'success': False,
                'error': 'Login failed. Please try again.'
            })

    def _handle_refresh(self):
        """
        Refresh authentication token.

        Request headers:
            Authorization: Bearer <current-token>

        Response:
            {
                "success": true,
                "token": "new-jwt-token"
            }
        """
        try:
            # Verify current token
            try:
                auth_data = verify_token(self)
            except Exception as e:
                logger.warning(f"Token refresh failed: {str(e)}")
                send_response(self, 401, {
                    'success': False,
                    'error': str(e)
                })
                return

            # Generate new token
            token = generate_token(auth_data['user_id'], auth_data['email'])

            send_response(self, 200, {
                'success': True,
                'token': token
            })

            logger.info(f"Token refreshed for user {auth_data['user_id']}")

        except Exception as e:
            logger.error(f"Token refresh failed: {str(e)}")
            send_response(self, 500, {
                'success': False,
                'error': 'Token refresh failed. Please login again.'
            })

    def _handle_verify(self):
        """
        Verify JWT token.

        Request headers:
            Authorization: Bearer <token>

        Response:
            {
                "success": true,
                "user": {
                    "id": "uuid",
                    "email": "user@example.com"
                }
            }
        """
        try:
            # Verify token
            try:
                auth_data = verify_token(self)
            except Exception as e:
                logger.warning(f"Token verification failed: {str(e)}")
                send_response(self, 401, {
                    'success': False,
                    'error': str(e)
                })
                return

            # Get database connection
            db = get_database()

            # Get user details from database
            user_data = db.get_user(auth_data['user_id'])

            if not user_data:
                send_response(self, 404, {
                    'success': False,
                    'error': 'User not found'
                })
                return

            send_response(self, 200, {
                'success': True,
                'user': {
                    'id': user_data['id'],
                    'email': user_data['email'],
                    'name': user_data['name']
                }
            })

            logger.info(f"Token verified for user {auth_data['user_id']}")

        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            send_response(self, 500, {
                'success': False,
                'error': 'Token verification failed'
            })
