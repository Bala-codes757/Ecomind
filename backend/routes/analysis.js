import express from 'express';
import db from '../config/db.js';
import { diagnoseRootCause } from '../services/aiService.js';
import { calculateSustainabilityProfile } from '../services/calculationEngine.js';
import { ValidationError } from '../errors/ValidationError.js';

const router = express.Router();

// 1. Run Complete Sustainability Diagnosis Analysis
router.post('/run', async (req, res, next) => {
  try {
    const { org_id = '11111111-1111-1111-1111-111111111111', extraction_data = {}, survey_session_id } = req.body;

    const surveyAnswers = survey_session_id
      ? db.get('survey_answers')
        .filter((answer) => answer.session_id === survey_session_id)
        .reduce((answers, answer) => {
          const question = db.getById('survey_questions', answer.question_id);
          if (question) answers[question.id] = answer.answer_value;
          return answers;
        }, {})
      : {};

    const surveyData = {
      primaryConcern: surveyAnswers['q-energy-1'],
      hvacUsage: surveyAnswers['q-energy-2-hvac'],
      operatingHours: surveyAnswers['q-energy-3-schedule']
    };

    const metrics = {
      electricityKWh: extraction_data.electricityKWh ?? extraction_data.consumption,
      waterLitres: extraction_data.waterLitres ?? extraction_data.water_litres,
      wasteKg: extraction_data.wasteKg ?? extraction_data.total_waste,
      recycledKg: extraction_data.recycledKg ?? extraction_data.recycled
    };

    const missingFields = Object.entries(metrics)
      .filter(([, value]) => value === null || value === undefined)
      .map(([field]) => field);
    for (const [field, value] of Object.entries(surveyData)) {
      if (value === undefined) missingFields.push(field);
    }
    if (missingFields.length > 0) {
      return res.status(400).json({ success: false, error: 'Missing required analysis fields', missingFields });
    }

    // 1. Deterministic Calculation
    const profile = calculateSustainabilityProfile(metrics);

    // Save Score Record
    const scoreRecord = db.insert('sustainability_scores', {
      org_id,
      overall_score: profile.overallScore,
      grade: profile.grade,
      energy_score: profile.energyScore,
      water_score: profile.waterScore,
      waste_score: profile.wasteScore,
      calculation_version: profile.calculationVersion
    });

    // 2. AI Root-Cause Diagnosis (Server-Side AI)
    const diagnosis = await diagnoseRootCause({
      primaryConcern: surveyData.primaryConcern,
      consumption: metrics.electricityKWh,
      hvacUsage: surveyData.hvacUsage,
      operatingHours: surveyData.operatingHours
    });

    const analysisRecord = db.insert('analysis_results', {
      org_id,
      primary_concern: surveyData.primaryConcern,
      probable_root_cause: diagnosis.probable_root_cause,
      company_need: diagnosis.company_need,
      reasoning: diagnosis.reasoning,
      trade_offs: diagnosis.trade_offs,
      ai_used: diagnosis.usedAIFallback === false,
      raw_facts_json: profile
    });

    res.json({
      success: true,
      score: scoreRecord,
      analysis: analysisRecord,
      profile
    });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ success: false, error: 'ValidationError', message: err.message, field: err.field });
    }
    next(err);
  }
});

// 2. Get Analysis Result by Org ID
router.get('/:orgId', (req, res, next) => {
  try {
    const { orgId } = req.params;
    const scores = db.get('sustainability_scores').filter((s) => s.org_id === orgId);
    const analyses = db.get('analysis_results').filter((a) => a.org_id === orgId);

    const latestScore = scores.slice(-1)[0];
    const latestAnalysis = analyses.slice(-1)[0];
    if (!latestScore || !latestAnalysis) {
      return res.status(404).json({ error: 'No analysis exists yet for this organization' });
    }

    res.json({
      success: true,
      score: latestScore,
      analysis: latestAnalysis
    });
  } catch (err) {
    next(err);
  }
});

export default router;
