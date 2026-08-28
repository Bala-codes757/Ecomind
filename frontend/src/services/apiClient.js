// EcoMind API Client - Connects React Frontend to Express Backend Server

const HOST = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const API_BASE = `http://${HOST}:5000/api`;
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || '';

/**
 * Helper fetch wrapper handling errors and JSON parsing
 */
async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(ADMIN_KEY ? { 'x-admin-key': ADMIN_KEY } : {}),
        ...options.headers
      },
      ...options
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Backend request failed');
    }
    return data;
  } catch (err) {
    console.error(`[APIClient Error] ${endpoint}:`, err);
    throw err;
  }
}

// 1. Documents API
export async function uploadDocumentFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData
  });
  return await res.json();
}

export async function extractDocument(documentId, fileName, fileType) {
  return await request('/documents/extract', {
    method: 'POST',
    body: JSON.stringify({ document_id: documentId, file_name: fileName, file_type: fileType })
  });
}

export async function verifyDocumentExtraction(extractionId, verifiedData) {
  return await request('/documents/verify', {
    method: 'POST',
    body: JSON.stringify({ extraction_id: extractionId, verified_data: verifiedData })
  });
}

// 2. Adaptive Survey API
export async function getSurveySession(moduleKey = 'energy') {
  return await request('/survey/session', {
    method: 'POST',
    body: JSON.stringify({ module_key: moduleKey })
  });
}

export async function submitSurveyAnswer(sessionId, questionId, answerValue) {
  return await request('/survey/answer', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId, question_id: questionId, answer_value: answerValue })
  });
}

// 3. Analysis & Sustainability Diagnosis API
export async function runAnalysis(extractionData = {}, surveySessionId = null) {
  return await request('/analysis/run', {
    method: 'POST',
    body: JSON.stringify({ extraction_data: extractionData, survey_session_id: surveySessionId })
  });
}

export async function getAnalysisResult(orgId = '11111111-1111-1111-1111-111111111111') {
  return await request(`/analysis/${orgId}`);
}

// 4. Recommendations & Action Comparison API
export async function getRecommendations() {
  return await request('/recommendations');
}

export async function compareActions(actionIds) {
  return await request('/recommendations/compare', {
    method: 'POST',
    body: JSON.stringify({ action_ids: actionIds })
  });
}

export async function saveActionPlan(recommendationId) {
  return await request('/recommendations/plan', {
    method: 'POST',
    body: JSON.stringify({ recommendation_id: recommendationId })
  });
}

// 5. What-If Simulator API
export async function simulateScenarioParams(params) {
  return await request('/scenario/simulate', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

// 6. Progress Tracking API
export async function getProgressHistory(orgId = '11111111-1111-1111-1111-111111111111') {
  return await request(`/progress/${orgId}`);
}

// 7. Admin Configuration API
export async function getAdminConfig() {
  return await request('/admin/config');
}

export async function getModules() {
  return await request('/modules');
}

export async function saveAdminModule(moduleData) {
  return await request('/admin/modules', {
    method: 'POST',
    body: JSON.stringify(moduleData)
  });
}

// 8. IoT Normalized Telemetry API
export async function getIoTReadings() {
  return await request('/iot/readings');
}

export async function triggerIoTSimulation() {
  return await request('/iot/simulate', {
    method: 'POST'
  });
}

export default {
  uploadDocumentFile,
  extractDocument,
  verifyDocumentExtraction,
  getSurveySession,
  submitSurveyAnswer,
  runAnalysis,
  getAnalysisResult,
  getRecommendations,
  compareActions,
  saveActionPlan,
  simulateScenarioParams,
  getProgressHistory,
  getAdminConfig,
  getModules,
  saveAdminModule,
  getIoTReadings,
  triggerIoTSimulation
};
