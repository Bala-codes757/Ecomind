import express from 'express';
import {
  chatWithDecarbonizationEngineer,
  performAnomalyScan,
  generateExecutiveBoardMemo
} from '../services/aiService.js';

const router = express.Router();

/**
 * POST /api/ai/chat
 * Interactive conversation with Gemini-powered Decarbonization Engineer
 */
router.post('/chat', async (req, res, next) => {
  try {
    const { message, conversationHistory, facilityContext } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const result = await chatWithDecarbonizationEngineer({
      message,
      conversationHistory: conversationHistory || [],
      facilityContext: facilityContext || {}
    });

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ai/anomaly-scan
 * Run intelligent forensic scan on live telemetry & equipment metrics
 */
router.post('/anomaly-scan', async (req, res, next) => {
  try {
    const { telemetryData, facilityContext } = req.body;

    const result = await performAnomalyScan({
      telemetryData: telemetryData || {},
      facilityContext: facilityContext || {}
    });

    res.json({
      success: true,
      scan: result
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ai/board-memo
 * Generate an authentic board-level capital investment memo
 */
router.post('/board-memo', async (req, res, next) => {
  try {
    const { facilityContext, plannedActions, scoreData } = req.body;

    const result = await generateExecutiveBoardMemo({
      facilityContext: facilityContext || {},
      plannedActions: plannedActions || [],
      scoreData: scoreData || {}
    });

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
});

export default router;
