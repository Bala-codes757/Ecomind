import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// 1. Get Recommendations
router.get('/', (req, res, next) => {
  try {
    const recs = db.get('recommendations');
    res.json({
      success: true,
      recommendations: recs
    });
  } catch (err) {
    next(err);
  }
});

// 2. Compare Action Plan Items (up to 3)
router.post('/compare', (req, res, next) => {
  try {
    const { action_ids = [] } = req.body;
    const allRecs = db.get('recommendations');
    const selected = allRecs.filter((r) => action_ids.includes(r.id));
    const missingIds = action_ids.filter((id) => !allRecs.some((recommendation) => recommendation.id === id));
    if (missingIds.length > 0) {
      return res.status(404).json({ error: 'NotFound', resource: 'recommendation', id: missingIds[0] });
    }

    res.json({
      success: true,
      selectedActions: selected,
      recommendationRationale: 'EcoMind recommends HVAC Scheduling Override as the top immediate priority because it requires $0 capital expenditure while delivering +7 EcoScore points in under 4 months.'
    });
  } catch (err) {
    next(err);
  }
});

// 3. Save Action Plan
router.post('/plan', (req, res, next) => {
  try {
    const { org_id = '11111111-1111-1111-1111-111111111111', recommendation_id } = req.body;
    if (!db.getById('recommendations', recommendation_id)) {
      return res.status(404).json({ error: 'NotFound', resource: 'recommendation', id: recommendation_id });
    }
    const plan = db.insert('action_plans', {
      org_id,
      recommendation_id,
      status: 'planned'
    });

    res.json({
      success: true,
      plan,
      message: 'Action saved to enterprise decarbonization plan'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
