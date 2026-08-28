import express from 'express';
import db from '../config/db.js';

const router = express.Router();

router.get('/:orgId', (req, res, next) => {
  try {
    const { orgId } = req.params;
    if (!orgId || !/^[0-9a-f-]{36}$/i.test(orgId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const scores = db.get('sustainability_scores').filter((score) => score.org_id === orgId);
    if (scores.length === 0) {
      return res.status(404).json({ error: 'No progress history yet for this organization' });
    }

    const history = scores.map((score) => ({
      month: new Date(score.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      score: score.overall_score,
      energy: score.energy_score,
      water: score.water_score,
      waste: score.waste_score
    }));

    const completedActions = db.get('action_plans')
      .filter((plan) => plan.org_id === orgId && plan.status === 'completed')
      .map((plan) => ({
        id: plan.id,
        title: db.getById('recommendations', plan.recommendation_id)?.title || 'Saved action',
        date: plan.created_at,
        impact: `+${db.getById('recommendations', plan.recommendation_id)?.score_delta || 0} Pts`
      }));

    res.json({
      success: true,
      baselineScore: history[0].score,
      currentScore: history[history.length - 1].score,
      targetScore: 85,
      history,
      completedActions,
      nextRecommendation: db.get('recommendations')[0]?.title || null
    });
  } catch (err) {
    next(err);
  }
});

export default router;
