import express from 'express';
import { calculateSustainabilityProfile } from '../services/calculationEngine.js';
import { ValidationError } from '../errors/ValidationError.js';

const router = express.Router();

router.post('/calculate', (req, res, next) => {
  try {
    const { metrics, weights } = req.body;
    const result = calculateSustainabilityProfile(metrics, weights);
    res.json({
      success: true,
      result
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: err.message, field: err.field });
    }
    next(err);
  }
});

export default router;
