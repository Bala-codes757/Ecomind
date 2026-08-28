import express from 'express';
import db from '../config/db.js';
import { getOrCreateSession, processAnswerAndGetNext } from '../services/surveyEngine.js';

const router = express.Router();

// 1. Initialize or resume survey session
router.post('/session', (req, res, next) => {
  try {
    const { org_id = '11111111-1111-1111-1111-111111111111', module_key = 'energy' } = req.body;
    const session = getOrCreateSession(org_id, module_key);

    const questions = db.get('survey_questions').filter((q) => q.module_key === module_key);
    const currentQ = questions.find((q) => q.id === session.current_question_id) || questions[0];

    res.json({
      success: true,
      session,
      currentQuestion: currentQ
    });
  } catch (err) {
    next(err);
  }
});

// 2. Process survey answer and get dynamic next branching question
router.post('/answer', (req, res, next) => {
  try {
    const { session_id, question_id, answer_value } = req.body;
    if (!session_id || !question_id || !answer_value) {
      return res.status(400).json({ success: false, error: 'Missing required session, question, or answer payload' });
    }

    const result = processAnswerAndGetNext(session_id, question_id, answer_value);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
});

export default router;
