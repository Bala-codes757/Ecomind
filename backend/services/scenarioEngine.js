// EcoMind Deterministic What-If Scenario Simulator Engine
import { calculateSustainabilityProfile } from './calculationEngine.js';

/**
 * Simulate what-if decarbonization investments
 * @param {Object} baselineMetrics - Current metrics
 * @param {Object} changes - { solarPercent, waterRecyclePercent, wasteDiversionPercent }
 * @returns {Object}
 */
export function simulateScenario(baselineMetrics = {}, changes = {}) {
  const {
    electricityKWh = 12450,
    waterLitres = 85000,
    wasteKg = 1250,
    recycledKg = 420
  } = baselineMetrics;

  const {
    solarPercent = 0,
    waterRecyclePercent = 0,
    wasteDiversionPercent = 0
  } = changes;

  // 1. Current Baseline Profile
  const baseline = calculateSustainabilityProfile(baselineMetrics);

  // 2. Apply Scenario Transformations
  const simulatedElectricityKWh = Math.round(electricityKWh * (1 - (solarPercent / 100)));
  const simulatedWaterLitres = Math.round(waterLitres * (1 - (waterRecyclePercent / 100)));
  
  const additionalRecycled = Math.round((wasteKg - recycledKg) * (wasteDiversionPercent / 100));
  const simulatedRecycledKg = Math.min(wasteKg, recycledKg + additionalRecycled);

  const simulatedProfile = calculateSustainabilityProfile({
    electricityKWh: simulatedElectricityKWh,
    waterLitres: simulatedWaterLitres,
    wasteKg,
    recycledKg: simulatedRecycledKg
  });

  // 3. Exact Financial & Emission Deltas
  const electricitySavingsUSD = Math.round((electricityKWh - simulatedElectricityKWh) * 0.15); // $0.15 / kWh
  const waterSavingsUSD = Math.round(((waterLitres - simulatedWaterLitres) / 1000) * 2.80); // $2.80 / 1000L
  const wasteSavingsUSD = Math.round((additionalRecycled) * 0.12); // $0.12 / kg diversion

  const totalCostSavingsUSD = electricitySavingsUSD + waterSavingsUSD + wasteSavingsUSD;
  const co2ReductionTons = parseFloat((baseline.emissions.totalCO2eTons - simulatedProfile.emissions.totalCO2eTons).toFixed(2));
  const scoreDelta = simulatedProfile.overallScore - baseline.overallScore;

  return {
    baselineScore: baseline.overallScore,
    projectedScore: simulatedProfile.overallScore,
    scoreDelta,
    baselineGrade: baseline.grade,
    projectedGrade: simulatedProfile.grade,
    baselineEmissionsTons: baseline.emissions.totalCO2eTons,
    projectedEmissionsTons: simulatedProfile.emissions.totalCO2eTons,
    co2ReductionTons,
    estimatedCostSavingsUSD: totalCostSavingsUSD,
    changes: {
      electricityKWhDelta: electricityKWh - simulatedElectricityKWh,
      waterLitresDelta: waterLitres - simulatedWaterLitres,
      recycledKgDelta: additionalRecycled
    }
  };
}

export default {
  simulateScenario
};
