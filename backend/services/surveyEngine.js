// EcoMind Adaptive Database-Driven Survey Engine
import db from '../config/db.js';

/**
 * Initialize or retrieve dynamic survey session
 * @param {string} orgId 
 * @param {string} moduleKey 
 * @returns {Object}
 */
export function getOrCreateSession(orgId = '11111111-1111-1111-1111-111111111111', moduleKey = 'energy') {
  const sessions = db.get('survey_sessions');
  let session = sessions.find((s) => s.org_id === orgId && s.module_key === moduleKey && s.status === 'in_progress');

  if (!session) {
    const questions = db.get('survey_questions').filter((q) => q.module_key === moduleKey);
    const firstQ = questions.sort((a, b) => a.order_index - b.order_index)[0];

    session = db.insert('survey_sessions', {
      org_id: orgId,
      module_key: moduleKey,
      status: 'in_progress',
      current_question_id: firstQ ? firstQ.id : null
    });
  }

  return session;
}

/**
 * Compute the next dynamic question based on user answers and database branch rules
 * @param {string} sessionId 
 * @param {string} currentQuestionId 
 * @param {string} answerValue 
 * @returns {Object} { nextQuestion, isComplete }
 */
export function processAnswerAndGetNext(sessionId, currentQuestionId, answerValue) {
  const session = db.getById('survey_sessions', sessionId);
  if (!session) {
    throw new Error('Survey session not found');
  }

  // 1. Save or update answer in DB
  const existingAnswers = db.get('survey_answers').filter((a) => a.session_id === sessionId);
  const existingIndex = existingAnswers.find((a) => a.question_id === currentQuestionId);

  if (existingIndex) {
    db.update('survey_answers', existingIndex.id, { answer_value: answerValue });
  } else {
    db.insert('survey_answers', {
      session_id: sessionId,
      question_id: currentQuestionId,
      answer_value: answerValue
    });
  }

  // 2. Check Database Branch Rules for override next question
  const branchRules = db.get('survey_branch_rules');
  const matchedRule = branchRules.find((r) => r.question_id === currentQuestionId && r.trigger_option_value === answerValue);

  const allQuestions = db.get('survey_questions')
    .filter((q) => q.module_key === session.module_key)
    .sort((a, b) => a.order_index - b.order_index);

  let nextQuestion = null;

  if (matchedRule && matchedRule.next_question_id) {
    nextQuestion = allQuestions.find((q) => q.id === matchedRule.next_question_id);
  } else {
    // Sequential fallback question
    const currentQ = allQuestions.find((q) => q.id === currentQuestionId);
    if (currentQ) {
      nextQuestion = allQuestions.find((q) => q.order_index > currentQ.order_index);
    }
  }

  if (nextQuestion) {
    db.update('survey_sessions', sessionId, { current_question_id: nextQuestion.id });
    return {
      session_id: sessionId,
      isComplete: false,
      nextQuestion
    };
  }

  // Survey Complete
  db.update('survey_sessions', sessionId, { status: 'completed' });
  return {
    session_id: sessionId,
    isComplete: true,
    nextQuestion: null
  };
}

export default {
  getOrCreateSession,
  processAnswerAndGetNext
};
