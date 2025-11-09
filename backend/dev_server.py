"""
Local Development Server for VrikshAI Backend

This Flask server runs the backend API locally on port 5001
for development and testing before deploying to Vercel.

Usage:
    python backend/dev_server.py
"""

import os
import sys
import json
from flask import Flask, request, Response
from flask_cors import CORS
from io import BytesIO
from http.server import BaseHTTPRequestHandler

# Add backend and api directories to path for imports
backend_dir = os.path.dirname(os.path.abspath(__file__))
api_dir = os.path.join(backend_dir, 'api')
sys.path.insert(0, backend_dir)
sys.path.insert(0, api_dir)  # Add api directory for _utils imports

# Load environment variables
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(backend_dir), '.env'))

# Import Vercel handler classes
# Import from api.* since api_dir is in sys.path
import auth
import darshan
import vana
import chikitsa
import seva

AuthHandler = auth.handler
DarshanHandler = darshan.handler
VanaHandler = vana.handler
ChikitsaHandler = chikitsa.handler
SevaHandler = seva.handler

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


# ============================================================================
# Request Adapter - Converts Flask Request to BaseHTTPRequestHandler
# ============================================================================

class RequestAdapter(BaseHTTPRequestHandler):
    """
    Adapter to make Flask request compatible with BaseHTTPRequestHandler.
    This allows us to reuse the Vercel serverless handlers locally.
    """

    def __init__(self, flask_request, method='POST'):
        """Initialize with Flask request data."""
        self.flask_request = flask_request
        self.command = method
        self.path = flask_request.path
        self.request_version = 'HTTP/1.1'
        self.requestline = f"{method} {flask_request.path} HTTP/1.1"
        self.client_address = (flask_request.remote_addr or '127.0.0.1', 0)
        self.server = None

        # Convert Flask headers to http.client.HTTPMessage format
        self.headers = flask_request.headers

        # Create readable stream from request data
        self.rfile = BytesIO(flask_request.get_data())

        # Create writable stream for response BODY only
        self.wfile = BytesIO()

        # Track response
        self._status_code = 200
        self._response_headers = []
        self._response_sent = False

    def send_response(self, code, message=None):
        """Capture response status code (don't write to wfile)."""
        self._status_code = code
        self._response_sent = True

    def send_header(self, keyword, value):
        """Capture response headers (don't write to wfile)."""
        self._response_headers.append((keyword, value))

    def end_headers(self):
        """Headers are complete (don't write to wfile)."""
        pass

    def log_request(self, code='-', size='-'):
        """Suppress default logging."""
        pass

    def get_response(self):
        """Extract the response data."""
        self.wfile.seek(0)
        body = self.wfile.read()

        # Build headers dict
        headers = {}
        for key, value in self._response_headers:
            headers[key] = value

        return {
            'status': self._status_code,
            'body': body.decode('utf-8') if body else '',
            'headers': headers
        }


def call_handler(handler_class, flask_request, method='POST'):
    """
    Call a Vercel handler with Flask request data.

    Args:
        handler_class: The BaseHTTPRequestHandler class to instantiate
        flask_request: Flask request object
        method: HTTP method (POST, GET, PUT, DELETE, OPTIONS)

    Returns:
        Flask Response object
    """
    # Create adapter
    adapter = RequestAdapter(flask_request, method)

    # Call the appropriate handler method
    try:
        if method == 'OPTIONS':
            if hasattr(handler_class, 'do_OPTIONS'):
                handler_instance = handler_class.__new__(handler_class)
                handler_instance.__dict__.update(adapter.__dict__)
                handler_instance.do_OPTIONS()
            else:
                # Default OPTIONS response
                adapter.send_response(200)
                adapter.send_header('Access-Control-Allow-Origin', '*')
                adapter.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                adapter.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                adapter.end_headers()
        elif method == 'POST':
            handler_instance = handler_class.__new__(handler_class)
            handler_instance.__dict__.update(adapter.__dict__)
            handler_instance.do_POST()
        elif method == 'GET':
            handler_instance = handler_class.__new__(handler_class)
            handler_instance.__dict__.update(adapter.__dict__)
            handler_instance.do_GET()
        elif method == 'PUT':
            handler_instance = handler_class.__new__(handler_class)
            handler_instance.__dict__.update(adapter.__dict__)
            handler_instance.do_PUT()
        elif method == 'DELETE':
            handler_instance = handler_class.__new__(handler_class)
            handler_instance.__dict__.update(adapter.__dict__)
            handler_instance.do_DELETE()
    except Exception as e:
        print(f"Handler error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            response=json.dumps({'error': str(e)}),
            status=500,
            mimetype='application/json'
        )

    # Get response from adapter
    response_data = adapter.get_response()

    # Create Flask response
    return Response(
        response=response_data['body'],
        status=response_data['status'],
        headers=response_data['headers']
    )


# ============================================================================
# Auth Routes
# ============================================================================

@app.route('/api/auth/signup', methods=['POST', 'OPTIONS'])
@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
@app.route('/api/auth/refresh', methods=['POST', 'OPTIONS'])
@app.route('/api/auth/verify', methods=['GET', 'OPTIONS'])
def auth_routes():
    """Handle authentication routes"""
    return call_handler(AuthHandler, request, request.method)


# ============================================================================
# Darshan Route (AI Plant Identification)
# ============================================================================

@app.route('/api/darshan', methods=['POST', 'OPTIONS'])
def darshan_route():
    """Handle darshan (plant identification) endpoint"""
    return call_handler(DarshanHandler, request, request.method)


# ============================================================================
# Vana Routes (Plant Collection)
# ============================================================================

@app.route('/api/vana', methods=['GET', 'POST', 'OPTIONS'])
@app.route('/api/vana/<plant_id>', methods=['GET', 'PUT', 'DELETE', 'OPTIONS'])
def vana_routes(plant_id=None):
    """Handle vana (plant collection) endpoints"""
    # Inject plant_id into path if provided
    if plant_id:
        request.path = f'/api/vana/{plant_id}'
    return call_handler(VanaHandler, request, request.method)


# ============================================================================
# Chikitsa Routes (Health Diagnosis)
# ============================================================================

@app.route('/api/chikitsa', methods=['POST', 'OPTIONS'])
@app.route('/api/chikitsa/<plant_id>', methods=['GET', 'OPTIONS'])
def chikitsa_routes(plant_id=None):
    """Handle chikitsa (health diagnosis) endpoints"""
    # Inject plant_id into path if provided
    if plant_id:
        request.path = f'/api/chikitsa/{plant_id}'
    return call_handler(ChikitsaHandler, request, request.method)


# ============================================================================
# Seva Routes (Care Schedules)
# ============================================================================

@app.route('/api/seva', methods=['GET', 'POST', 'OPTIONS'])
@app.route('/api/seva/<reminder_id>', methods=['PUT', 'DELETE', 'OPTIONS'])
def seva_routes(reminder_id=None):
    """Handle seva (care reminders) endpoints"""
    # Inject reminder_id into path if provided
    if reminder_id:
        request.path = f'/api/seva/{reminder_id}'
    return call_handler(SevaHandler, request, request.method)


# ============================================================================
# Health Check
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return Response(
        response=json.dumps({
            'status': 'healthy',
            'message': 'VrikshAI Backend API is running locally',
            'version': '1.0.0'
        }),
        status=200,
        mimetype='application/json'
    )


# ============================================================================
# Error Handlers
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return Response(
        response=json.dumps({'error': 'Endpoint not found'}),
        status=404,
        mimetype='application/json'
    )


@app.errorhandler(500)
def internal_error(error):
    return Response(
        response=json.dumps({'error': 'Internal server error'}),
        status=500,
        mimetype='application/json'
    )


# ============================================================================
# Main
# ============================================================================

if __name__ == '__main__':
    print("=" * 60)
    print("🌱 VrikshAI Backend Development Server")
    print("=" * 60)
    print(f"✅ Server running at: http://localhost:5001")
    print(f"✅ Health check: http://localhost:5001/api/health")
    print(f"✅ Frontend should proxy /api/* to http://localhost:5001/api/*")
    print("=" * 60)
    print("\nAvailable endpoints:")
    print("  POST   /api/auth/signup")
    print("  POST   /api/auth/login")
    print("  POST   /api/auth/refresh")
    print("  GET    /api/auth/verify")
    print("  POST   /api/darshan")
    print("  GET    /api/vana")
    print("  POST   /api/vana")
    print("  GET    /api/vana/<id>")
    print("  PUT    /api/vana/<id>")
    print("  DELETE /api/vana/<id>")
    print("  GET    /api/chikitsa/<plant_id>")
    print("  POST   /api/chikitsa")
    print("  GET    /api/seva")
    print("  POST   /api/seva")
    print("  PUT    /api/seva/<id>")
    print("  DELETE /api/seva/<id>")
    print("=" * 60)
    print("\nPress Ctrl+C to stop the server\n")

    app.run(host='0.0.0.0', port=5001, debug=True)
