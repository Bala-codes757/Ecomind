import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import documentsRouter from './routes/documents.js';
import surveyRouter from './routes/survey.js';
import analysisRouter from './routes/analysis.js';
import calculationRouter from './routes/calculation.js';
import recommendationsRouter from './routes/recommendations.js';
import scenarioRouter from './routes/scenario.js';
import progressRouter from './routes/progress.js';
import adminRouter from './routes/admin.js';
import iotRouter from './routes/iot.js';
import aiRouter from './routes/ai.js';
import { errorHandler } from './middleware/errorHandler.js';
import db from './config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.resolve(rootDir, 'frontend');

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static uploaded files safely
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      engine: 'EcoMind AI Sustainability Diagnosis Engine',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/modules', (req, res) => {
    res.json({ success: true, modules: db.get('modules') });
  });

  app.get('/api/organizations', (req, res) => {
    res.json({ success: true, organizations: db.get('organizations') });
  });

  app.get('/api/benchmarks', (req, res) => {
    res.json({ success: true, benchmarks: db.get('benchmarks'), emissionFactors: db.get('emission_factors') });
  });

  // API Routes
  app.use('/api/documents', documentsRouter);
  app.use('/api/survey', surveyRouter);
  app.use('/api/analysis', analysisRouter);
  app.use('/api/score', calculationRouter);
  app.use('/api/recommendations', recommendationsRouter);
  app.use('/api/scenario', scenarioRouter);
  app.use('/api/progress', progressRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/iot', iotRouter);
  app.use('/api/ai', aiRouter);

  // Global Error Handling Middleware for API routes
  app.use(errorHandler);

  // Frontend integration: Vite middleware in dev, static dist in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      root: frontendDir,
      configFile: path.resolve(frontendDir, 'vite.config.js'),
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(frontendDir, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`==================================================`);
    console.log(`🌱 EcoMind Engine running on http://0.0.0.0:${PORT}`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log(`==================================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
