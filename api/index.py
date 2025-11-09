"""
VrikshAI API - Vercel Entry Point

This file serves as the main entry point for Vercel serverless deployment.
It routes all API requests to the appropriate handlers.
"""

from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Import all API handlers
from api import auth, darshan, chikitsa, seva, vana


def enable_cors(handler):
    """Add CORS headers to response"""
    handler.send_header('Access-Control-Allow-Origin', '*')
    handler.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    handler.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')


class handler(BaseHTTPRequestHandler):
    """Main request handler for Vercel"""

    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.send_response(200)
        enable_cors(self)
        self.end_headers()

    def do_GET(self):
        """Handle GET requests"""
        path = self.path

        # Vana endpoints
        if path == '/api/vana' or path.startswith('/api/vana?'):
            return vana.handler(self)
        elif path.startswith('/api/vana/'):
            return vana.handler(self)

        # Auth verify endpoint
        elif path == '/api/auth/verify':
            return auth.handler(self)

        # Default 404
        else:
            self.send_response(404)
            enable_cors(self)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())

    def do_POST(self):
        """Handle POST requests"""
        path = self.path

        # Auth endpoints
        if path == '/api/auth/login':
            return auth.handler(self)
        elif path == '/api/auth/signup':
            return auth.handler(self)

        # AI endpoints
        elif path == '/api/darshan':
            return darshan.handler(self)
        elif path == '/api/chikitsa':
            return chikitsa.handler(self)
        elif path == '/api/seva':
            return seva.handler(self)

        # Vana endpoint
        elif path == '/api/vana':
            return vana.handler(self)

        # Default 404
        else:
            self.send_response(404)
            enable_cors(self)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())

    def do_PUT(self):
        """Handle PUT requests"""
        path = self.path

        # Vana update endpoint
        if path.startswith('/api/vana/'):
            return vana.handler(self)

        # Default 404
        else:
            self.send_response(404)
            enable_cors(self)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())

    def do_DELETE(self):
        """Handle DELETE requests"""
        path = self.path

        # Vana delete endpoint
        if path.startswith('/api/vana/'):
            return vana.handler(self)

        # Default 404
        else:
            self.send_response(404)
            enable_cors(self)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())
