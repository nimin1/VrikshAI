"""
Authentication middleware for VrikshAI.

Provides JWT token generation and verification for secure API access.
"""

import os
import jwt
import logging
from datetime import datetime, timedelta
from typing import Dict, Any
from http.server import BaseHTTPRequestHandler

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Token expiration: 7 days
TOKEN_EXPIRATION_DAYS = 7


def generate_token(user_id: str, email: str) -> str:
    """
    Generate a JWT token for authenticated user.

    Args:
        user_id: User's UUID
        email: User's email address

    Returns:
        JWT token string

    Raises:
        ValueError: If JWT_SECRET is not set
    """
    secret = os.getenv('JWT_SECRET')
    if not secret:
        raise ValueError("JWT_SECRET environment variable is required")

    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(days=TOKEN_EXPIRATION_DAYS),
        'iat': datetime.utcnow()
    }

    token = jwt.encode(payload, secret, algorithm='HS256')
    logger.info(f"Token generated for user {user_id}")
    return token


def verify_token(request: BaseHTTPRequestHandler) -> Dict[str, Any]:
    """
    Verify JWT token from request Authorization header.

    Args:
        request: HTTP request handler with headers

    Returns:
        Dictionary with user_id and email

    Raises:
        Exception: If token is missing, expired, or invalid
    """
    try:
        # Extract Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            raise Exception("Missing Authorization header")

        # Extract Bearer token
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            raise Exception("Invalid Authorization header format. Use: Bearer <token>")

        token = parts[1]

        # Verify token
        secret = os.getenv('JWT_SECRET')
        if not secret:
            raise ValueError("JWT_SECRET environment variable is required")

        payload = jwt.decode(token, secret, algorithms=['HS256'])

        logger.info(f"Token verified for user {payload['user_id']}")
        return {
            'user_id': payload['user_id'],
            'email': payload['email']
        }

    except jwt.ExpiredSignatureError:
        logger.warning("Expired token attempt")
        raise Exception("Token has expired. Please login again.")

    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token attempt: {str(e)}")
        raise Exception("Invalid token. Please login again.")

    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise
