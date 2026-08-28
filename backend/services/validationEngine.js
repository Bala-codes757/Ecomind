// EcoMind Data Validation Engine
// Ensures extracted document values are sanitized before reaching calculation engine.

/**
 * Validate extracted document data
 * @param {Object} rawExtraction - Raw extraction from AI/parser
 * @returns {Object} { isValid, validationStatus, sanitizedData, issues, confidenceScore }
 */
export function validateExtraction(rawExtraction = {}) {
  const issues = [];
  let isValid = true;
  let confidence = rawExtraction.confidence_score || 0.95;

  const sanitized = {
    billing_period: rawExtraction.billing_period || 'August 2026',
    consumption: Number(rawExtraction.consumption) || 0,
    unit: rawExtraction.unit || 'kWh',
    amount: Number(rawExtraction.amount) || 0,
    previous_reading: Number(rawExtraction.previous_reading) || 0,
    current_reading: Number(rawExtraction.current_reading) || 0,
    total_waste: Number(rawExtraction.total_waste) || 0,
    recycled: Number(rawExtraction.recycled) || 0,
    reused: Number(rawExtraction.reused) || 0,
    landfilled: Number(rawExtraction.landfilled) || 0
  };

  // 1. Negative Value Check
  if (sanitized.consumption < 0) {
    issues.push('Consumption value cannot be negative.');
    sanitized.consumption = Math.abs(sanitized.consumption);
    confidence -= 0.2;
    isValid = false;
  }

  if (sanitized.amount < 0) {
    issues.push('Billing amount cannot be negative.');
    sanitized.amount = Math.abs(sanitized.amount);
    confidence -= 0.15;
    isValid = false;
  }

  // 2. Meter Reading Logic Check
  if (sanitized.current_reading > 0 && sanitized.previous_reading > 0) {
    const delta = sanitized.current_reading - sanitized.previous_reading;
    if (delta <= 0) {
      issues.push('Current meter reading must be greater than previous meter reading.');
      confidence -= 0.25;
      isValid = false;
    } else if (sanitized.consumption === 0) {
      sanitized.consumption = delta;
    }
  }

  // 3. Extreme Outlier Bounds Check (Electricity kWh > 10,000,000)
  if (sanitized.unit.toLowerCase() === 'kwh' && sanitized.consumption > 10000000) {
    issues.push('Consumption exceeds realistic industrial facility threshold.');
    confidence -= 0.3;
    isValid = false;
  }

  // 4. Missing Core Values
  if (sanitized.consumption === 0 && sanitized.amount === 0) {
    issues.push('Document contains missing utility usage and cost values.');
    confidence -= 0.4;
    isValid = false;
  }

  const confidenceScore = Math.max(0.1, Math.min(1.0, parseFloat(confidence.toFixed(2))));
  const requiresVerification = confidenceScore < 0.85 || !isValid;

  return {
    isValid,
    requiresVerification,
    validationStatus: requiresVerification ? 'verification_required' : 'passed',
    sanitizedData: sanitized,
    issues,
    confidenceScore,
    validatedAt: new Date().toISOString()
  };
}

export default {
  validateExtraction
};
