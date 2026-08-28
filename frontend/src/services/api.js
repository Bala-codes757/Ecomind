// EcoMind API Placeholder Service Layer
// Serves mock data for document extraction, sustainability analysis, diagnosis, and simulations.

import {
  activeModules,
  futureModules,
  sampleIngestionFiles,
  mockEcoScoreAnalysis,
  mockRecommendations,
  mockProgressData
} from '../data/mockData';

/**
 * Upload a document (bill, report, spreadsheet, image)
 * @param {File|Object} file 
 * @returns {Promise<Object>}
 */
export async function uploadDocument(file) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const fileName = file.name || file.fileName || 'Uploaded_Document.pdf';
  return {
    success: true,
    documentId: `doc-${Date.now()}`,
    fileName: fileName,
    fileSize: file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '1.5 MB',
    uploadedAt: new Date().toISOString(),
    status: 'Uploaded',
    message: 'Document uploaded successfully. Ready for AI extraction.'
  };
}

/**
 * Extract structured sustainability metrics from uploaded document
 * @param {string} documentId 
 * @returns {Promise<Object>}
 */
export async function extractDocumentData(documentId) {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return {
    success: true,
    documentId,
    extractedMetrics: {
      utilityProvider: 'Metropolitan Grid Power Co.',
      billingPeriod: 'July 2026 - August 2026',
      totalKWh: 142500,
      peakDemandKW: 480,
      totalCostUSD: 18525.50,
      co2eTons: 62.7,
      confidenceScore: 0.96
    },
    validationStatus: 'Passed'
  };
}

/**
 * Fetch complete EcoScore analysis and AI root-cause diagnosis
 * @param {string} organizationId 
 * @returns {Promise<Object>}
 */
export async function getAnalysis(organizationId = 'org-default') {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    success: true,
    organizationId,
    data: mockEcoScoreAnalysis
  };
}

/**
 * Fetch recommended sustainability action plan
 * @param {string} analysisId 
 * @returns {Promise<Array>}
 */
export async function getRecommendations(analysisId = 'analysis-1') {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    analysisId,
    recommendations: mockRecommendations
  };
}

/**
 * Calculate what-if simulation scenario based on user input parameters
 * @param {Object} scenarioParams 
 * @returns {Promise<Object>}
 */
export async function calculateScenario(scenarioParams = {}) {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const { solarPercent = 0, waterRecyclePercent = 0, wasteDiversionPercent = 0 } = scenarioParams;

  const baseScore = 74;
  const solarBoost = (solarPercent / 100) * 12;
  const waterBoost = (waterRecyclePercent / 100) * 8;
  const wasteBoost = (wasteDiversionPercent / 100) * 6;

  const simulatedScore = Math.min(100, Math.round(baseScore + solarBoost + waterBoost + wasteBoost));
  const carbonSavedTons = Math.round((solarPercent * 0.4) + (waterRecyclePercent * 0.15) + (wasteDiversionPercent * 0.2));
  const costSavingsAnnualUSD = Math.round((solarPercent * 180) + (waterRecyclePercent * 90) + (wasteDiversionPercent * 75));

  return {
    success: true,
    simulatedScore,
    scoreDelta: simulatedScore - baseScore,
    carbonSavedTons,
    costSavingsAnnualUSD,
    projectedGrade: simulatedScore >= 90 ? 'A+' : simulatedScore >= 85 ? 'A' : simulatedScore >= 80 ? 'A-' : 'B+'
  };
}

/**
 * Get historical sustainability progress tracking data
 * @param {string} organizationId 
 * @returns {Promise<Array>}
 */
export async function getProgress(organizationId = 'org-default') {
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    success: true,
    organizationId,
    history: mockProgressData
  };
}

// DEV FALLBACK ONLY — not used in production code paths
export const mockApi = {
  uploadDocument,
  extractDocumentData,
  getAnalysis,
  getRecommendations,
  calculateScenario,
  getProgress
};

export default mockApi;
