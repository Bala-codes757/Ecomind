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

// 2. Export Entire Database (Generic Backup)
router.get('/export', (req, res, next) => {
  try {
    const backup = db.exportAll();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=ecomind_backup_${Date.now()}.json`);
    res.json(backup);
  } catch (err) {
    next(err);
  }
});

// 3. Import Full Database Backup
router.post('/import', (req, res, next) => {
  try {
    const result = db.importAll(req.body);
    res.json({
      success: true,
      message: 'System database successfully restored',
      result
    });
  } catch (err) {
    res.status(400).json({ error: 'ImportFailed', message: err.message });
  }
});

// 4. Reset to Clean Default Baseline
router.post('/reset', (req, res, next) => {
  try {
    db.reset();
    res.json({
      success: true,
      message: 'Database reset to clean baseline configuration'
    });
  } catch (err) {
    next(err);
  }
});

// 5. System & Storage Statistics
router.get('/stats', (req, res, next) => {
  try {
    const all = db.exportAll().data;
    const counts = {};
    for (const [key, val] of Object.entries(all)) {
      counts[key] = Array.isArray(val) ? val.length : 1;
    }

    res.json({
      success: true,
      storage_mode: 'Generic Standalone (Zero Google Lock-in)',
      active_driver: 'File-backed Persistent JSON / Relational Adapter',
      record_counts: counts,
      server_time: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

// 6. Export Table as CSV
router.get('/export/csv/:table', (req, res, next) => {
  try {
    const { table } = req.params;
    const records = db.get(table);
    if (!records || records.length === 0) {
      return res.status(404).send('No records found for table');
    }

    const headers = Object.keys(records[0]);
    const csvRows = [
      headers.join(','),
      ...records.map(row => headers.map(fieldName => JSON.stringify(row[fieldName] ?? '')).join(','))
    ];
    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=ecomind_${table}_${Date.now()}.csv`);
    res.send(csvContent);
  } catch (err) {
    next(err);
  }
});

// 7. Add or Edit Module
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

// 8. Delete Module
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

// 9. Add or Edit Survey Question
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

