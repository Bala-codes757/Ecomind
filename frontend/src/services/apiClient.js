// EcoMind API Client - Connects React Frontend to Express Backend Server

const API_BASE = '/api';
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
  let filePayload = file;
  if (!(file instanceof Blob)) {
    const textContent = `Facility Utility & Resource Report: ${file.name || 'document'}\nBilling Period: July 2026\nConsumption: 142500 kWh\nTotal Amount: $18525.50\nPeak Demand: 480 kW\nWater Consumption: 85000 Litres\nTotal Waste: 1250 kg\nRecycled Waste: 420 kg`;
    filePayload = new File([textContent], file.name || 'document.txt', { type: 'text/plain' });
  }
  formData.append('file', filePayload);

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

// 7. Admin Configuration & Standalone Storage API
export async function getAdminConfig() {
  return await request('/admin/config');
}

export async function getModules() {
  return await request('/modules');
}

export async function getOrganizations() {
  return await request('/organizations');
}

export async function getBenchmarks() {
  return await request('/benchmarks');
}

export async function saveAdminModule(moduleData) {
  return await request('/admin/modules', {
    method: 'POST',
    body: JSON.stringify(moduleData)
  });
}

export async function getSystemStats() {
  return await request('/admin/stats');
}

export async function exportSystemBackup() {
  const res = await fetch(`${API_BASE}/admin/export`, {
    headers: {
      ...(ADMIN_KEY ? { 'x-admin-key': ADMIN_KEY } : {})
    }
  });
  return await res.json();
}

export async function importSystemBackup(backupData) {
  return await request('/admin/import', {
    method: 'POST',
    body: JSON.stringify(backupData)
  });
}

export async function resetSystemDatabase() {
  return await request('/admin/reset', {
    method: 'POST'
  });
}

export async function updateActionPlanStatus(planId, status, assignedTo) {
  return await request(`/recommendations/plan/${planId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, assigned_to: assignedTo })
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

// 9. Server-Side AI Engineering Co-Pilot & Forensics API

export async function sendAIChat(message, conversationHistory = [], facilityContext = {}) {
  return await request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, conversationHistory, facilityContext })
  });
}

export async function runAIAnomalyScan(telemetryData = {}, facilityContext = {}) {
  return await request('/ai/anomaly-scan', {
    method: 'POST',
    body: JSON.stringify({ telemetryData, facilityContext })
  });
}

export async function generateAIBoardMemo(facilityContext = {}, plannedActions = [], scoreData = {}) {
  return await request('/ai/board-memo', {
    method: 'POST',
    body: JSON.stringify({ facilityContext, plannedActions, scoreData })
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
  triggerIoTSimulation,
  sendAIChat,
  runAIAnomalyScan,
  generateAIBoardMemo
};
