// EcoMind Pure Deterministic Calculation Engine
// STRICT REQUIREMENT: No AI/LLM for arithmetic. All sustainability metrics use exact mathematical formulas.

import db from '../config/db.js';
import { ValidationError } from '../errors/ValidationError.js';

/**
 * Calculate Scope 1, Scope 2 emissions and domain EcoScores
 * @param {Object} metrics - { electricityKWh, waterLitres, wasteKg, recycledKg }
 * @param {Object} weights - { energyWeight: 45, waterWeight: 30, wasteWeight: 25 }
 * @returns {Object}
 */
export function calculateSustainabilityProfile(metrics = {}, weights = { energyWeight: 45, waterWeight: 30, wasteWeight: 25 }) {
  const {
    electricityKWh = 12450,
    waterLitres = 85000,
    wasteKg = 1250,
    recycledKg = 420
  } = metrics;

  for (const [field, value] of Object.entries({ electricityKWh, waterLitres, wasteKg, recycledKg })) {
    if (!Number.isFinite(value) || value < 0) {
      throw new ValidationError(`${field} must be a non-negative number`, field);
    }
  }
  if (recycledKg > wasteKg) {
    throw new ValidationError('recycledKg cannot exceed wasteKg', 'recycledKg');
  }

  const weightValues = [weights.energyWeight, weights.waterWeight, weights.wasteWeight];
  if (weightValues.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new ValidationError('Score weights must be non-negative numbers', 'weights');
  }
  const totalWeight = weightValues.reduce((sum, value) => sum + value, 0);
  if (totalWeight <= 0) {
    throw new ValidationError('Score weights must sum to more than zero', 'weights');
  }
  const normalizedWeights = weightValues.map((value) => value / totalWeight);

  // Retrieve Configurable Emission Factors from DB
  const factors = db.get('emission_factors');
  const elecFactor = (factors.find((f) => f.category === 'electricity') || {}).factor_value || 0.4402;
  const waterFactor = (factors.find((f) => f.category === 'water') || {}).factor_value || 0.0003;
  const wasteFactor = (factors.find((f) => f.category === 'waste_landfill') || {}).factor_value || 0.7200;

  // 1. Exact Carbon Accounting Calculations
  const energyEmissionsTons = (electricityKWh * elecFactor) / 1000;
  const waterEmissionsTons = (waterLitres * waterFactor) / 1000;

  const landfilledKg = Math.max(0, wasteKg - recycledKg);
  const wasteEmissionsTons = (landfilledKg * wasteFactor) / 1000;

  const totalCO2eTons = parseFloat((energyEmissionsTons + waterEmissionsTons + wasteEmissionsTons).toFixed(2));

  // 2. Recycling Rate Ratio Calculation
  const recyclingRatePercent = Math.max(0, Math.min(100, wasteKg > 0 ? Math.round((recycledKg / wasteKg) * 100) : 0));

  // 3. Domain EcoScores (0 - 100 scale)
  // Energy score: benchmark baseline 15,000 kWh per month
  const energyScore = Math.max(20, Math.min(100, Math.round(100 - (electricityKWh / 15000) * 35)));

  // Water score: benchmark baseline 100,000 litres per month
  const waterScore = Math.max(20, Math.min(100, Math.round(100 - (waterLitres / 100000) * 25)));

  // Waste score: based on recycling diversion rate
  const wasteScore = Math.max(20, Math.min(100, Math.round(40 + (recyclingRatePercent * 0.6))));

  // 4. Overall Weighted EcoScore
  const weightedSum = (energyScore * normalizedWeights[0]) + (waterScore * normalizedWeights[1]) + (wasteScore * normalizedWeights[2]);
  const overallScore = Math.round(weightedSum);

  // Grade Mapping
  let grade = 'F';
  if (overallScore >= 90) grade = 'A+';
  else if (overallScore >= 85) grade = 'A';
  else if (overallScore >= 80) grade = 'A-';
  else if (overallScore >= 74) grade = 'B+';
  else if (overallScore >= 70) grade = 'B';
  else if (overallScore >= 60) grade = 'C';

  return {
    overallScore,
    grade,
    energyScore,
    waterScore,
    wasteScore,
    metrics: {
      electricityKWh,
      waterLitres,
      wasteKg,
      recycledKg,
      recyclingRatePercent
    },
    emissions: {
      totalCO2eTons,
      energyEmissionsTons: parseFloat(energyEmissionsTons.toFixed(2)),
      waterEmissionsTons: parseFloat(waterEmissionsTons.toFixed(2)),
      wasteEmissionsTons: parseFloat(wasteEmissionsTons.toFixed(2))
    },
    factors: {
      elecFactor,
      waterFactor,
      wasteFactor
    },
    calculationVersion: 'v1.0.0'
  };
}

export default {
  calculateSustainabilityProfile
};
