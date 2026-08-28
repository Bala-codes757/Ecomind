import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// 1. Get Recommendations
router.get('/', (req, res, next) => {
  try {
    const recs = db.get('recommendations');
    const plans = db.get('action_plans');
    res.json({
      success: true,
      recommendations: recs,
      actionPlans: plans
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

    res.json({
      success: true,
      selectedActions: selected,
      recommendationRationale: 'EcoMind recommends HVAC Scheduling Override as the top immediate priority because it requires minimal capital expenditure while delivering +7 EcoScore points in under 4 months.'
    });
  } catch (err) {
    next(err);
  }
});

// 3. Save or Update Action Plan
router.post('/plan', (req, res, next) => {
  try {
    const { org_id = '11111111-1111-1111-1111-111111111111', recommendation_id, status = 'planned', assigned_to = 'Facilities Team', target_completion } = req.body;
    
    // Check if already in action plans
    const existing = db.get('action_plans').find(p => p.recommendation_id === recommendation_id);
    if (existing) {
      const updated = db.update('action_plans', existing.id, { status, assigned_to, target_completion });
      return res.json({ success: true, plan: updated, message: 'Action plan updated' });
    }

    const plan = db.insert('action_plans', {
      org_id,
      recommendation_id,
      status,
      assigned_to,
      target_completion: target_completion || new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]
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

// 4. Update Plan Status
router.patch('/plan/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assigned_to } = req.body;
    const updated = db.update('action_plans', id, { status, assigned_to });
    if (!updated) return res.status(404).json({ error: 'Plan not found' });
    res.json({ success: true, plan: updated });
  } catch (err) {
    next(err);
  }
});

export default router;

