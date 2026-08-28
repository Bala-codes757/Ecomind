import express from 'express';
import db from '../config/db.js';
import requireAdminKey from '../middleware/requireAdminKey.js';

const router = express.Router();
router.use(requireAdminKey);

// 1. Get Complete Engine Configuration
router.get('/config', (req, res, next) => {
  try {
    res.json({
      success: true,
      modules: db.get('modules'),
      questions: db.get('survey_questions'),
      branchRules: db.get('survey_branch_rules'),
      recommendations: db.get('recommendations'),
      emissionFactors: db.get('emission_factors'),
      benchmarks: db.get('benchmarks')
    });
  } catch (err) {
    next(err);
  }
});

// 2. Add or Edit Module
router.post('/modules', (req, res, next) => {
  try {
    const { id, key, name, description, is_active, badge, icon } = req.body;
    if (id) {
      const updated = db.update('modules', id, { key, name, description, is_active, badge, icon });
      if (!updated) return res.status(404).json({ error: 'NotFound', resource: 'module', id });
      return res.json({ success: true, module: updated });
    }
    const created = db.insert('modules', { key, name, description, is_active: is_active ?? true, badge: badge || 'Active', icon: icon || 'Layers' });
    res.json({ success: true, module: created });
  } catch (err) {
    next(err);
  }
});

// 3. Delete Module
router.delete('/modules/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    if (!db.getById('modules', id)) {
      return res.status(404).json({ error: 'NotFound', resource: 'module', id });
    }
    db.delete('modules', id);
    res.json({ success: true, message: 'Module deleted' });
  } catch (err) {
    next(err);
  }
});

// 4. Add or Edit Survey Question
router.post('/questions', (req, res, next) => {
  try {
    const { id, module_key, question_text, question_type, options } = req.body;
    if (id) {
      const updated = db.update('survey_questions', id, { module_key, question_text, question_type, options });
      if (!updated) return res.status(404).json({ error: 'NotFound', resource: 'survey_question', id });
      return res.json({ success: true, question: updated });
    }
    const created = db.insert('survey_questions', {
      module_key: module_key || 'energy',
      question_text,
      question_type: question_type || 'single_choice',
      options: options || []
    });
    res.json({ success: true, question: created });
  } catch (err) {
    next(err);
  }
});

export default router;
