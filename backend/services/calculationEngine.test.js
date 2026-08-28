import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSustainabilityProfile } from './calculationEngine.js';

test('calculates a valid sustainability profile', () => {
  const result = calculateSustainabilityProfile({ electricityKWh: 12450, waterLitres: 85000, wasteKg: 1250, recycledKg: 420 });
  assert.equal(result.overallScore, 71);
  assert.equal(result.emissions.totalCO2eTons, 6.1);
});

test('rejects negative metrics', () => {
  assert.throws(() => calculateSustainabilityProfile({ electricityKWh: -100 }), /electricityKWh must be a non-negative number/);
});

test('rejects zero total weights', () => {
  assert.throws(() => calculateSustainabilityProfile({}, { energyWeight: 0, waterWeight: 0, wasteWeight: 0 }), /weights must sum to more than zero/);
});

test('rejects recycled waste above total waste', () => {
  assert.throws(() => calculateSustainabilityProfile({ wasteKg: 100, recycledKg: 101 }), /recycledKg cannot exceed wasteKg/);
});