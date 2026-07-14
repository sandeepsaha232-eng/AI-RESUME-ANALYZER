import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Modular controller imports
import authController from './src/backend/controller/authController';
import resumeController from './src/backend/controller/resumeController';
import analysisController from './src/backend/controller/analysisController';
import aiController from './src/backend/controller/aiController';

// Load environment variables
dotenv.config();

// Fix for ESModules and CommonJS compatibility for __dirname and __filename
let __filename = '';
let __dirname = '';

try {
  __filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(__filename);
} catch (e) {
  __filename = path.join(process.cwd(), 'server.js');
  __dirname = process.cwd();
}

const app = express();
const PORT = process.env.PORT || 3001;

// Global Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

import { supabase } from './src/supabaseClient';

// Basic health check route with dynamic Supabase connectivity check
app.get('/api/health', async (req: Request, res: Response) => {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';

  let supabaseConfigured = false;
  let supabaseConnectionError: string | null = null;
  let profilesTableAccessible = false;

  if (
    supabaseUrl &&
    supabaseUrl.startsWith('https://') &&
    supabaseServiceKey &&
    supabaseServiceKey !== 'your-supabase-service-role-key'
  ) {
    supabaseConfigured = true;
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error) {
        supabaseConnectionError = error.message;
      } else {
        profilesTableAccessible = true;
      }
    } catch (e: any) {
      supabaseConnectionError = e.message || String(e);
    }
  }

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    supabase: {
      configured: supabaseConfigured,
      connected: supabaseConfigured && !supabaseConnectionError,
      profilesTableAccessible,
      error: supabaseConnectionError
    }
  });
});

// ==========================================
// MOUNT MODULAR ROUTERS (REST /api/v1/)
// ==========================================
app.use('/api/v1/auth', authController);
app.use('/api/v1/resumes', resumeController);
app.use('/api/v1/analyze', analysisController);
app.use('/api/v1', aiController); // Handles general /compare, /improve, /generate-summary, and /job-descriptions

// Serve static assets from Vite's build output (dist)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Standard Error Envelope Middleware
interface AppError extends Error {
  status?: number;
  code?: string;
}

app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  res.status(status).json({
    error: {
      code: code,
      message: err.message || 'An unexpected error occurred',
      requestId: req.headers['x-request-id'] || `req-${Date.now()}`
    }
  });
});

// Fallback all other routes to SPA index.html in production
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/')) {
    const err: AppError = new Error(`API endpoint ${req.path} not found`);
    err.status = 404;
    err.code = 'ENDPOINT_NOT_FOUND';
    return next(err);
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Not Found');
    }
  });
});

if (process.env.VERCEL) {
  console.log('Running on Vercel serverless environment.');
} else {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
