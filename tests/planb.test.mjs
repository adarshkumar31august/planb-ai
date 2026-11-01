import test from 'node:test';
import assert from 'node:assert/strict';

// Import our compiled dist or test against logic functions
// Since tests run under Node, let's create a pure logic test verifying all algorithms
import {
  formatINR,
  calculateTotalAllocated,
  calculateTotalActual,
  getBudgetHealth,
  calculateBudgetDelta,
} from '../src/utils/budgetCalculations.ts';

import {
  simulateCollegeFarewell18k,
  simulateGenericBudgetReduction,
  simulateGuestSurge,
  simulateVenueShift,
} from '../src/utils/scenarioEngine.ts';

import { generateEmergencySolution } from '../src/utils/emergencyEngine.ts';
import { validateEventForm } from '../src/utils/validators.ts';
import { SAMPLE_EVENTS } from '../src/data/sampleData.ts';

test('1. Baseline College Farewell Sample Data Integrity', () => {
  const collegeEvent = SAMPLE_EVENTS.find(e => e.id === 'evt-college-farewell-2026');
  assert.ok(collegeEvent, 'College farewell event must exist in sample data');
  assert.equal(collegeEvent.guestCount, 100);
  assert.equal(collegeEvent.totalBudget, 25000);

  const totalAllocated = calculateTotalAllocated(collegeEvent.expenses);
  assert.equal(totalAllocated, 25000, 'Baseline expenses must sum to exactly ₹25,000');

  const health = getBudgetHealth(collegeEvent.totalBudget, totalAllocated);
  assert.equal(health.status, 'caution', '100% allocation with 0 unallocated buffer is caution state');
  assert.equal(health.remainingAmount, 0);
});

test('2. Signature What If? Scenario: College Farewell 25k -> 18k Cap Non-Exceedance', () => {
  const collegeEvent = SAMPLE_EVENTS.find(e => e.id === 'evt-college-farewell-2026');
  assert.ok(collegeEvent);

  const simResult = simulateCollegeFarewell18k(collegeEvent);

  // Requirement: target cap ₹18,000
  assert.equal(simResult.maxAllowedBudget, 18000);
  assert.equal(simResult.isBudgetCompliant, true);

  const proposedSum = calculateTotalAllocated(simResult.proposedEvent.expenses);
  assert.ok(
    proposedSum <= 18000,
    `CRITICAL REQUIREMENT: Proposed budget ₹${proposedSum} must not exceed ₹18,000`
  );
  assert.equal(proposedSum, 18000, 'Proposed budget should exactly equal ₹18,000');

  // Verify specific category allocations:
  // Venue (Auditorium): 2000
  // Catering (Snack boxes): 9500
  // AV (Auditorium + mics): 2500
  // Decor (Mementos & photo wall): 2500
  // Contingency: 1500
  // Sum = 2000 + 9500 + 2500 + 2500 + 1500 = 18000
  const venue = simResult.proposedEvent.expenses.find(e => e.category === 'venue');
  const catering = simResult.proposedEvent.expenses.find(e => e.category === 'catering');
  const av = simResult.proposedEvent.expenses.find(e => e.category === 'entertainment_av');
  const decor = simResult.proposedEvent.expenses.find(e => e.category === 'decor');
  const contingency = simResult.proposedEvent.expenses.find(e => e.category === 'contingency');

  assert.equal(venue?.allocatedAmount, 2000);
  assert.equal(catering?.allocatedAmount, 9500);
  assert.equal(av?.allocatedAmount, 2500);
  assert.equal(decor?.allocatedAmount, 2500);
  assert.equal(contingency?.allocatedAmount, 1500);

  // Delta verification
  assert.equal(simResult.deltaSummary.originalTotal, 25000);
  assert.equal(simResult.deltaSummary.proposedTotal, 18000);
  assert.equal(simResult.deltaSummary.difference, -7000);
  assert.equal(simResult.deltaSummary.isWithinBudget, true);

  // Changes & tasks must be populated with clear rationales
  assert.ok(simResult.changes.length >= 4, 'Must have concrete changes');
  simResult.changes.forEach(c => {
    assert.ok(c.rationale.length > 10, 'Each change must have explanatory rationale');
  });
  assert.ok(simResult.affectedTasks.length >= 2, 'Must list affected tasks');
  assert.ok(simResult.strategicAdvice.length >= 3, 'Must provide strategic advice');
});

test('3. Generic 30% Budget Reduction Engine', () => {
  const weddingEvent = SAMPLE_EVENTS.find(e => e.id === 'evt-sangeet-rohan-priya');
  assert.ok(weddingEvent);

  const simResult = simulateGenericBudgetReduction(weddingEvent, 0.30);
  const targetCap = Math.round(weddingEvent.totalBudget * 0.70); // 315,000

  const proposedSum = calculateTotalAllocated(simResult.proposedEvent.expenses);
  assert.ok(
    proposedSum <= targetCap,
    `Proposed sum ₹${proposedSum} must be <= ₹${targetCap}`
  );
  assert.equal(simResult.isBudgetCompliant, true);
});

test('4. Guest Surge Engine', () => {
  const collegeEvent = SAMPLE_EVENTS.find(e => e.id === 'evt-college-farewell-2026');
  assert.ok(collegeEvent);

  const simResult = simulateGuestSurge(collegeEvent);
  assert.equal(simResult.proposedEvent.guestCount, 150);
  assert.ok(simResult.affectedTasks.length > 0);
});

test('5. Form Validation Engine', () => {
  // Empty form
  const emptyCheck = validateEventForm({
    name: '',
    type: '',
    date: '',
    location: '',
    guestCount: '',
    totalBudget: '',
    venuePreference: '',
  });
  assert.equal(emptyCheck.isValid, false);
  assert.ok(emptyCheck.errors.name);
  assert.ok(emptyCheck.errors.type);
  assert.ok(emptyCheck.errors.date);
  assert.ok(emptyCheck.errors.location);
  assert.ok(emptyCheck.errors.guestCount);
  assert.ok(emptyCheck.errors.totalBudget);

  // Negative budget
  const negativeCheck = validateEventForm({
    name: 'Test Event',
    type: 'birthday',
    date: '2026-12-01',
    location: 'Mumbai',
    guestCount: 50,
    totalBudget: -500,
    venuePreference: 'indoor',
  });
  assert.equal(negativeCheck.isValid, false);
  assert.ok(negativeCheck.errors.totalBudget);

  // Valid form
  const validCheck = validateEventForm({
    name: 'Alumni Dinner',
    type: 'college',
    date: '2026-11-25',
    location: 'Auditorium',
    guestCount: 80,
    totalBudget: 40000,
    venuePreference: 'indoor',
  });
  assert.equal(validCheck.isValid, true);
});

test('6. Emergency Mode Protocol Engine', () => {
  const emergency = generateEmergencySolution(
    'Catering food truck broke down 2 hours before arrival',
    2,
    6000
  );

  assert.equal(emergency.triagePriority, 'CRITICAL');
  assert.ok(emergency.actions.length >= 3);
  assert.ok(emergency.actions.some(a => a.phase.includes('Immediate')));
  assert.ok(emergency.contingencyAdvice.length > 20);
  // Unverified sample flag must be present on commercial recommendations
  assert.ok(emergency.actions.some(a => a.isUnverifiedSample === true));
});

test('7. Currency Formatter Verification', () => {
  const formatted25k = formatINR(25000);
  assert.ok(formatted25k.includes('25,000'), 'Must format 25,000 in Indian number system');
  const formatted0 = formatINR(0);
  assert.ok(formatted0.includes('0'));
});
