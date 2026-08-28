// EcoMind AI Service Abstraction Layer (Gemini API Integration)
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Extract structured information from uploaded document
 * @param {Object} documentParams - { fileName, fileType, textContent }
 * @returns {Promise<Object>}
 */
export async function extractDocumentMetrics(documentParams) {
  const { fileName = '', fileType = 'PDF', textContent = '' } = documentParams;

  if (!genAI) {
    const error = new Error('GEMINI_API_KEY is not configured');
    error.status = 503;
    throw error;
  }

  try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are a specialized enterprise sustainability document parser.
Analyze this ${fileType} document named "${fileName}". Content text snippet: "${textContent.slice(0, 2000)}".
Return ONLY valid JSON matching this structure without markdown fences:
{
  "billing_period": "Month Year",
  "consumption": 12450,
  "unit": "kWh",
  "amount": 98500,
  "previous_reading": 112070,
  "current_reading": 124520,
  "confidence_score": 0.96
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return { ...JSON.parse(cleaned), usedAIFallback: false };
  } catch (err) {
    console.error('[Gemini API Error] Extraction failed:', err.message, err.stack);
    if (!err.status) err.status = 502;
    throw err;
  }
}

/**
 * Generate AI Root-Cause Diagnosis using deterministic facts
 * @param {Object} facts - { primaryConcern, energyConsumption, operatingHours, hvacUsage, score }
 * @returns {Promise<Object>}
 */
export async function diagnoseRootCause(facts) {
  const { primaryConcern, consumption, hvacUsage, operatingHours } = facts;

  if (!genAI) {
    const error = new Error('GEMINI_API_KEY is not configured');
    error.status = 503;
    throw error;
  }

  try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are EcoMind AI Root-Cause Diagnosis Engine.
Given these deterministic facts about an industrial facility:
- Primary Concern: ${primaryConcern}
- Monthly Consumption: ${consumption} kWh
- Equipment Load: ${hvacUsage}
- Schedule: ${operatingHours}

Return ONLY valid JSON matching this schema:
{
  "probable_root_cause": "Detailed root cause string",
  "company_need": "Exact operational need string",
  "reasoning": "Scientific step-by-step diagnostic reasoning",
  "trade_offs": "Cost vs disruption trade-off summary"
}`;

      const result = await model.generateContent(prompt);
      const cleaned = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '').trim();
      return { ...JSON.parse(cleaned), usedAIFallback: false };
  } catch (err) {
    console.error('[Gemini API Error] Diagnosis failed:', err.message, err.stack);
    if (!err.status) err.status = 502;
    throw err;
  }
}

export default {
  extractDocumentMetrics,
  diagnoseRootCause
};
