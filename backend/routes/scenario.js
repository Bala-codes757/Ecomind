import express from 'express';
import db from '../config/db.js';
import { simulateScenario } from '../services/scenarioEngine.js';

const router = express.Router();

router.post('/simulate', (req, res, next) => {
  try {
    const {
      solarPercent = 0,
      waterRecyclePercent = 0,
      wasteDiversionPercent = 0,
      org_id = '11111111-1111-1111-1111-111111111111'
    } = req.body;

    const baselineMetrics = {
      electricityKWh: 12450,
      waterLitres: 85000,
      wasteKg: 1250,
      recycledKg: 420
    };

    const simulation = simulateScenario(baselineMetrics, {
      solarPercent,
      waterRecyclePercent,
      wasteDiversionPercent
    });

    db.insert('scenario_results', {
      org_id,
      input_params_json: { solarPercent, waterRecyclePercent, wasteDiversionPercent },
      simulated_score: simulation.projectedScore,
      score_delta: simulation.scoreDelta,
      carbon_saved_tons: simulation.co2ReductionTons,
      cost_savings_usd: simulation.estimatedCostSavingsUSD
    });

    res.json({
      success: true,
      simulation
    });
  } catch (err) {
    next(err);
  }
});

export default router;
