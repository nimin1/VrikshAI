/**
 * Development Server for VrikshAI
 *
 * Runs Express server that:
 * - Serves API endpoints from /api directory (serverless functions)
 * - Proxies frontend requests to React dev server
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8000;
const REACT_DEV_SERVER = 'http://localhost:3001';

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// API Routes - Import serverless functions
console.log('Loading API routes...');

// Darshan endpoint
app.post('/api/darshan', async (req, res) => {
  try {
    const handler = (await import('./api/darshan.js')).default;
    await handler(req, res);
  } catch (error) {
    console.error('Darshan error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.options('/api/darshan', async (req, res) => {
  res.status(200).json({ success: true });
});

// Auth endpoints
app.post('/api/auth/signup', async (req, res) => {
  try {
    const handler = (await import('./api/auth.js')).default;
    await handler(req, res);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const handler = (await import('./api/auth.js')).default;
    await handler(req, res);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const handler = (await import('./api/auth.js')).default;
    await handler(req, res);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/auth/verify', async (req, res) => {
  try {
    const handler = (await import('./api/auth.js')).default;
    await handler(req, res);
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vana endpoints - specific ID route first
app.all('/api/vana/:id', async (req, res) => {
  try {
    const handler = (await import('./api/vana.js')).default;
    await handler(req, res);
  } catch (error) {
    console.error('Vana error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vana endpoints - base route
app.all('/api/vana', async (req, res) => {
  try {
    const handler = (await import('./api/vana.js')).default;
    await handler(req, res);
  } catch (error) {
    console.error('Vana error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Proxy all other requests to React dev server
app.use('/', createProxyMiddleware({
  target: REACT_DEV_SERVER,
  changeOrigin: true,
  ws: true, // Proxy websockets for HMR
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    res.status(500).send('Proxy error');
  }
}));

app.listen(PORT, () => {
  console.log('\n🌱 VrikshAI Development Server');
  console.log('================================');
  console.log(`Frontend + API: http://localhost:${PORT}`);
  console.log(`React Dev Server: ${REACT_DEV_SERVER}`);
  console.log('\nAPI Endpoints:');
  console.log('  POST /api/darshan - Plant identification');
  console.log('  POST /api/auth/signup - User signup');
  console.log('  POST /api/auth/login - User login');
  console.log('  GET  /api/auth/verify - Verify token');
  console.log('  POST /api/auth/refresh - Refresh token');
  console.log('  GET  /api/vana - List plants');
  console.log('  POST /api/vana - Add plant');
  console.log('  GET  /api/vana/:id - Get plant');
  console.log('  PUT  /api/vana/:id - Update plant');
  console.log('  DELETE /api/vana/:id - Delete plant');
  console.log('\nReady for development! 🚀\n');
});
