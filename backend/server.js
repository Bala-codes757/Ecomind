import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import documentsRouter from './routes/documents.js';
import surveyRouter from './routes/survey.js';
import analysisRouter from './routes/analysis.js';
import calculationRouter from './routes/calculation.js';
import recommendationsRouter from './routes/recommendations.js';
import scenarioRouter from './routes/scenario.js';
import progressRouter from './routes/progress.js';
import adminRouter from './routes/admin.js';
import iotRouter from './routes/iot.js';
import { errorHandler } from './middleware/errorHandler.js';
import db from './config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  }
}));
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

// Global Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`==================================================`);
  console.log(`🌱 EcoMind Backend Engine running on http://0.0.0.0:${PORT}`);
  console.log(`   Health Check: http://localhost:${PORT}/api/health`);
  console.log(`==================================================`);
});
