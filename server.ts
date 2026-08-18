import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import authRoutes from './server/routes/authRoutes';
import reelRoutes from './server/routes/reelRoutes';
import interestRoutes from './server/routes/interestRoutes';
import recommendationRoutes from './server/routes/recommendationRoutes';
import userRoutes from './server/routes/userRoutes';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic Middleware
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'TechReel AI API Server',
      timestamp: new Date().toISOString(),
      anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/reels', reelRoutes);
  app.use('/api/interests', interestRoutes);
  app.use('/api/recommendations', recommendationRoutes);
  app.use('/api', userRoutes);

  // Global API Error Handler
  app.use('/api/*', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Error:', err);
    res.status(500).json({
      success: false,
      message: 'An unexpected internal server error occurred.',
    });
  });

  // Vite middleware for development & SPA handling
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TechReel AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
