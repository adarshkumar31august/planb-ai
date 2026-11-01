import test from 'node:test';
import assert from 'node:assert/strict';

// In-memory localStorage mock for Node test environment
const storageMock = new Map();
const mockStorage = {
  getItem: (key) => storageMock.get(key) || null,
  setItem: (key, val) => storageMock.set(key, String(val)),
  removeItem: (key) => storageMock.delete(key),
  clear: () => storageMock.clear(),
};
globalThis.localStorage = mockStorage;
globalThis.window = { localStorage: mockStorage };

// Core budget calculations and formatters
import {
  formatINR,
  calculateTotalAllocated,
  calculateTotalActual,
  calculateTotalPaid,
  getBudgetHealth,
  calculateCategoryBreakdown,
  calculateBudgetDelta,
} from '../src/utils/budgetCalculations.ts';

// Scenario simulation engines
import {
  simulateCollegeFarewell18k,
  simulateGenericBudgetReduction,
  simulateGuestSurge,
  simulateVenueShift,
  simulateCatererCancellation,
  simulateTimeShift,
} from '../src/utils/scenarioEngine.ts';

// Emergency triage engine
import { generateEmergencySolution } from '../src/utils/emergencyEngine.ts';

// Validators and sanitization
import {
  validateEventForm,
  sanitizeTextInput,
  validateExpenseItem,
  validateTaskItem,
  validateVendorItem,
} from '../src/utils/validators.ts';

// Repository and sample fixtures
import { LocalStorageEventRepository } from '../src/services/eventRepository.ts';
import { SAMPLE_EVENTS } from '../src/data/sampleData.ts';

// -------------------------------------------------------------
// 1. BASELINE FIXTURE TESTS
// -------------------------------------------------------------

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

// -------------------------------------------------------------
// 2. SIGNATURE WHAT-IF SIMULATION TESTS
// -------------------------------------------------------------

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

test('4. Guest Surge Engine Default Ratio (+50%)', () => {
  const collegeEvent = SAMPLE_EVENTS.find(e => e.id === 'evt-college-farewell-2026');
  assert.ok(collegeEvent);

  const simResult = simulateGuestSurge(collegeEvent);
  assert.equal(simResult.proposedEvent.guestCount, 150);
  assert.ok(simResult.affectedTasks.length > 0);
});

// -------------------------------------------------------------
// 3. FORM VALIDATION & EMERGENCY TESTS
// -------------------------------------------------------------

test('5. Form Validation Engine Core Rules', () => {
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
  assert.ok(emergency.actions.some(a => a.isUnverifiedSample === true));
});

test('7. Currency Formatter Verification', () => {
  const formatted25k = formatINR(25000);
  assert.ok(formatted25k.includes('25,000'), 'Must format 25,000 in Indian number system');
  const formatted0 = formatINR(0);
  assert.ok(formatted0.includes('0'));
});

// -------------------------------------------------------------
// 4. EXPANDED BOUNDARY & NUMERIC EDGE CASE TESTS
// -------------------------------------------------------------

test('8. Currency Formatter - Boundary Cases (NaN, null, negative, crore)', () => {
  assert.equal(formatINR(NaN), '₹0');
  assert.equal(formatINR(null), '₹0');
  assert.equal(formatINR(undefined), '₹0');
  
  const negative = formatINR(-5000);
  assert.ok(negative.includes('5,000'), 'Formats negative amount');
  
  const crore = formatINR(10000000);
  assert.ok(crore.includes('1,00,00,000') || crore.includes('10,000,000'), 'Formats crore level amount');
});

test('9. Budget Calculations - calculateTotalAllocated edge cases', () => {
  assert.equal(calculateTotalAllocated([]), 0, 'Empty array returns 0');
  
  const items = [
    { allocatedAmount: 500 },
    { allocatedAmount: 0 },
    { allocatedAmount: '1500' }, // string coerced
    { allocatedAmount: -200 },
  ];
  assert.equal(calculateTotalAllocated(items), 1800);
});

test('10. Budget Calculations - calculateTotalActual and calculateTotalPaid accuracy', () => {
  const items = [
    { allocatedAmount: 1000, actualAmount: 950, paidAmount: 500 },
    { allocatedAmount: 2000, actualAmount: 2100, paidAmount: 2100 },
    { allocatedAmount: 500, actualAmount: 0, paidAmount: 0 },
  ];

  assert.equal(calculateTotalActual(items), 3050);
  assert.equal(calculateTotalPaid(items), 2600);
});

test('11. Budget Calculations - getBudgetHealth thresholds', () => {
  // Healthy surplus (< 90% allocated)
  const healthSurplus = getBudgetHealth(10000, 8000);
  assert.equal(healthSurplus.status, 'healthy');
  assert.equal(healthSurplus.percentUsed, 80);
  assert.equal(healthSurplus.remainingAmount, 2000);

  // Caution zone (90% to 100% allocated)
  const healthCaution = getBudgetHealth(10000, 9500);
  assert.equal(healthCaution.status, 'caution');
  assert.equal(healthCaution.remainingAmount, 500);

  // Deficit overspend (> 100% allocated)
  const healthDeficit = getBudgetHealth(10000, 11500);
  assert.equal(healthDeficit.status, 'exceeded');
  assert.equal(healthDeficit.remainingAmount, -1500);
  assert.equal(healthDeficit.percentUsed, 115);

  // Zero budget edge case
  const healthZero = getBudgetHealth(0, 1000);
  assert.equal(healthZero.status, 'exceeded');
});

test('12. Budget Calculations - calculateCategoryBreakdown aggregation', () => {
  const sampleExpenses = [
    { category: 'catering', allocatedAmount: 10000, actualAmount: 8000 },
    { category: 'catering', allocatedAmount: 2000, actualAmount: 2000 },
    { category: 'venue', allocatedAmount: 5000, actualAmount: 5000 },
  ];

  const breakdown = calculateCategoryBreakdown(sampleExpenses, 20000);
  const cateringAgg = breakdown.find(b => b.category === 'catering');
  const venueAgg = breakdown.find(b => b.category === 'venue');

  assert.ok(cateringAgg);
  assert.equal(cateringAgg.allocated, 12000);
  assert.equal(cateringAgg.actual, 10000);
  assert.equal(cateringAgg.itemCount, 2);
  assert.equal(cateringAgg.percentageOfTotal, 60); // 12000 / 20000 = 60%

  assert.ok(venueAgg);
  assert.equal(venueAgg.allocated, 5000);
  assert.equal(venueAgg.percentageOfTotal, 25); // 5000 / 20000 = 25%
});

test('13. Budget Calculations - calculateBudgetDelta single-pass map accuracy', () => {
  const orig = [
    { category: 'catering', allocatedAmount: 10000 },
    { category: 'venue', allocatedAmount: 5000 },
  ];
  const proposed = [
    { category: 'catering', allocatedAmount: 7000 }, // -3000
    { category: 'decor', allocatedAmount: 2000 },    // +2000 (new)
  ];

  const delta = calculateBudgetDelta(orig, proposed, 12000);
  assert.equal(delta.originalTotal, 15000);
  assert.equal(delta.proposedTotal, 9000);
  assert.equal(delta.difference, -6000);
  assert.equal(delta.isWithinBudget, true);

  const cateringCat = delta.categoryBreakdown.find(c => c.category === 'catering');
  assert.equal(cateringCat?.delta, -3000);

  const decorCat = delta.categoryBreakdown.find(c => c.category === 'decor');
  assert.equal(decorCat?.delta, 2000);
});

// -------------------------------------------------------------
// 5. SCENARIO ENGINES EXTENSIVE TESTS
// -------------------------------------------------------------

test('14. Scenario Engine - simulateGuestSurge with custom ratios (+20%, +80%)', () => {
  const collegeEvent = SAMPLE_EVENTS.find(e => e.id === 'evt-college-farewell-2026');
  assert.ok(collegeEvent);

  // +20% surge
  const surge20 = simulateGuestSurge(collegeEvent, 0.20);
  assert.equal(surge20.proposedEvent.guestCount, 120);
  assert.ok(surge20.isBudgetCompliant);

  // +80% surge
  const surge80 = simulateGuestSurge(collegeEvent, 0.80);
  assert.equal(surge80.proposedEvent.guestCount, 180);
  assert.ok(surge80.affectedTasks.length > 0);
});

test('15. Scenario Engine - simulateVenueShift (weather/rain relocation)', () => {
  const collegeEvent = SAMPLE_EVENTS.find(e => e.id === 'evt-college-farewell-2026');
  assert.ok(collegeEvent);

  const result = simulateVenueShift(collegeEvent);
  assert.equal(result.proposedEvent.venuePreference, 'indoor');
  assert.ok(result.changes.some(c => c.category.includes('Venue')));
  assert.ok(result.affectedTasks.some(t => t.taskTitle.toLowerCase().includes('signage') || t.taskTitle.toLowerCase().includes('arrival')));
});

test('16. Scenario Engine - simulateCatererCancellation (48h crisis)', () => {
  const collegeEvent = SAMPLE_EVENTS.find(e => e.id === 'evt-college-farewell-2026');
  assert.ok(collegeEvent);

  const result = simulateCatererCancellation(collegeEvent);
  assert.ok(result.changes.some(c => c.category.includes('Catering')));
  assert.ok(result.affectedTasks.length >= 2);
  assert.ok(result.strategicAdvice.length >= 2);
});

test('17. Scenario Engine - simulateTimeShift (delay / reschedule)', () => {
  const collegeEvent = SAMPLE_EVENTS.find(e => e.id === 'evt-college-farewell-2026');
  assert.ok(collegeEvent);

  const result = simulateTimeShift(collegeEvent);
  assert.ok(result.proposedEvent.time);
  assert.ok(result.affectedTasks.some(t => t.taskTitle.toLowerCase().includes('schedule') || t.taskTitle.toLowerCase().includes('sound')));
});

// -------------------------------------------------------------
// 6. VALIDATOR BOUNDARY & SECURITY TESTS
// -------------------------------------------------------------

test('18. Form Validation - Length boundaries (name 2 chars vs 3 chars, name >100)', () => {
  // 2 chars fails
  const shortName = validateEventForm({
    name: 'Ab',
    type: 'college',
    date: '2026-11-20',
    location: 'Campus',
    guestCount: 50,
    totalBudget: 10000,
    venuePreference: 'outdoor',
  });
  assert.equal(shortName.isValid, false);
  assert.ok(shortName.errors.name);

  // 3 chars succeeds
  const exactName = validateEventForm({
    name: 'Abc',
    type: 'college',
    date: '2026-11-20',
    location: 'Campus',
    guestCount: 50,
    totalBudget: 10000,
    venuePreference: 'outdoor',
  });
  assert.equal(exactName.isValid, true);

  // 101 chars fails
  const longName = validateEventForm({
    name: 'A'.repeat(101),
    type: 'college',
    date: '2026-11-20',
    location: 'Campus',
    guestCount: 50,
    totalBudget: 10000,
    venuePreference: 'outdoor',
  });
  assert.equal(longName.isValid, false);
  assert.ok(longName.errors.name);
});

test('19. Form Validation - Guest count boundaries (0, negative, 50,000, 50,001)', () => {
  const base = {
    name: 'Celebration Gala',
    type: 'corporate',
    date: '2026-12-05',
    location: 'Hotel Ballroom',
    totalBudget: 50000,
    venuePreference: 'indoor',
  };

  assert.equal(validateEventForm({ ...base, guestCount: 0 }).isValid, false);
  assert.equal(validateEventForm({ ...base, guestCount: -10 }).isValid, false);
  assert.equal(validateEventForm({ ...base, guestCount: 50000 }).isValid, true);
  assert.equal(validateEventForm({ ...base, guestCount: 50001 }).isValid, false);
});

test('20. Form Validation - Budget boundaries (0, negative, ₹999 vs ₹1,000)', () => {
  const base = {
    name: 'Celebration Gala',
    type: 'corporate',
    date: '2026-12-05',
    location: 'Hotel Ballroom',
    guestCount: 20,
    venuePreference: 'indoor',
  };

  assert.equal(validateEventForm({ ...base, totalBudget: 0 }).isValid, false);
  assert.equal(validateEventForm({ ...base, totalBudget: -500 }).isValid, false);
  assert.equal(validateEventForm({ ...base, totalBudget: 999 }).isValid, false);
  assert.equal(validateEventForm({ ...base, totalBudget: 1000 }).isValid, true);
});

test('21. Form Validation - Invalid dates handling', () => {
  const base = {
    name: 'Valid Name',
    type: 'birthday',
    location: 'Home Garden',
    guestCount: 15,
    totalBudget: 8000,
    venuePreference: 'outdoor',
  };

  const invalidDate = validateEventForm({ ...base, date: 'invalid-date-string' });
  assert.equal(invalidDate.isValid, false);
  assert.ok(invalidDate.errors.date);
});

test('22. Security Sanitization - sanitizeTextInput strips malicious script tags', () => {
  const dirty = '<script>alert("xss")</script>Annual Gala';
  const clean = sanitizeTextInput(dirty);
  assert.equal(clean, 'Annual Gala');
  assert.ok(!clean.includes('<script>'));
});

test('23. Security Sanitization - sanitizeTextInput strips dangerous tags and markup', () => {
  const dirty = '<style>body{color:red}</style><iframe src="evil.com"></iframe>Fresh Juices';
  const clean = sanitizeTextInput(dirty);
  assert.equal(clean, 'Fresh Juices');
});

test('24. Security Sanitization - preserves safe text and trims whitespace', () => {
  const text = '   ₹25,000 Special Package (Includes Sound & 2 Mics)   ';
  const clean = sanitizeTextInput(text);
  assert.equal(clean, '₹25,000 Special Package (Includes Sound & 2 Mics)');
});

test('25. Security Validation - validateExpenseItem boundary rules', () => {
  // Invalid short title
  assert.equal(validateExpenseItem({ name: 'A', allocatedAmount: 500, category: 'catering' }).isValid, false);

  // Negative amount
  assert.equal(validateExpenseItem({ name: 'Valid Snacks', allocatedAmount: -10, category: 'catering' }).isValid, false);

  // Valid item
  assert.equal(validateExpenseItem({ name: 'Valid Snacks', allocatedAmount: 2500, category: 'catering' }).isValid, true);
});

test('26. Security Validation - validateTaskItem boundary rules', () => {
  assert.equal(validateTaskItem({ title: 'A' }).isValid, false);
  assert.equal(validateTaskItem({ title: 'Valid Task Title', dueDate: 'invalid-date' }).isValid, false);
  assert.equal(validateTaskItem({ title: 'Valid Task Title', dueDate: '2026-11-20' }).isValid, true);
});

test('27. Security Validation - validateVendorItem boundary rules', () => {
  // Invalid short name
  assert.equal(validateVendorItem({ name: 'V' }).isValid, false);

  // Invalid email format
  assert.equal(validateVendorItem({ name: 'Royal Caterers', email: 'not-an-email' }).isValid, false);

  // Valid vendor
  assert.equal(validateVendorItem({ name: 'Royal Caterers', quotedAmount: 15000, email: 'contact@royal.in' }).isValid, true);
});

// -------------------------------------------------------------
// 7. REPOSITORY CRUD & PERSISTENCE INTEGRITY TESTS
// -------------------------------------------------------------

test('28. Repository Architecture - LocalStorage CRUD operations', async () => {
  storageMock.clear();
  const repo = new LocalStorageEventRepository();

  // Create
  const created = await repo.createEvent({
    name: 'Tech Symposium 2026',
    type: 'college',
    date: '2026-12-10',
    location: 'Seminar Hall 3',
    guestCount: 120,
    totalBudget: 45000,
    venuePreference: 'indoor',
    status: 'planning',
    expenses: [],
    tasks: [],
    vendors: [],
  });
  assert.ok(created.id);
  assert.equal(created.name, 'Tech Symposium 2026');

  // Read
  const fetched = await repo.getEventById(created.id);
  assert.ok(fetched);
  assert.equal(fetched.totalBudget, 45000);

  // Update
  const updated = await repo.updateEvent(created.id, { totalBudget: 50000 });
  assert.equal(updated.totalBudget, 50000);

  // Delete
  const deleted = await repo.deleteEvent(created.id);
  assert.equal(deleted, true);

  const reFetched = await repo.getEventById(created.id);
  assert.equal(reFetched, null);
});

test('29. Repository Architecture - Corrupted localStorage JSON recovery', async () => {
  // Store garbage non-JSON string
  storageMock.set('planb_ai_events_v1', 'corrupted-syntax-{{{bad_data');
  const repo = new LocalStorageEventRepository();

  const events = await repo.getAllEvents();
  assert.ok(Array.isArray(events), 'Should fall back gracefully to array');
  assert.ok(events.length > 0, 'Should load default sample fixtures');
});

test('30. Repository Architecture - Non-array localStorage JSON recovery', async () => {
  // Store a valid JSON object or number that is NOT an array
  storageMock.set('planb_ai_events_v1', JSON.stringify({ notAnArray: true }));
  const repo = new LocalStorageEventRepository();

  const events = await repo.getAllEvents();
  assert.ok(Array.isArray(events), 'Must detect non-array and safely reset');
  assert.ok(events.some(e => e.id === 'evt-college-farewell-2026'));
});

test('31. Repository Architecture - Plan revision snapshot, apply revision & rollback', async () => {
  storageMock.clear();
  const repo = new LocalStorageEventRepository();

  const event = await repo.createEvent({
    name: 'Versioned Celebration',
    type: 'birthday',
    date: '2026-11-30',
    location: 'Rooftop Lounge',
    guestCount: 40,
    totalBudget: 30000,
    venuePreference: 'outdoor',
    status: 'planning',
    expenses: [{ id: 'e1', eventId: '', category: 'catering', name: 'Original Catering', allocatedAmount: 15000, actualAmount: 0, paidAmount: 0, priority: 'essential', isModifiedByPlanB: false }],
    tasks: [],
    vendors: [],
  });

  // Apply revision (Plan B)
  const revisedEventState = {
    ...event,
    totalBudget: 22000,
    expenses: [{ id: 'e1', eventId: event.id, category: 'catering', name: 'Cost-Optimized Catering', allocatedAmount: 11000, actualAmount: 0, paidAmount: 0, priority: 'essential', isModifiedByPlanB: true }],
  };

  const applied = await repo.applyPlanRevision(
    event.id,
    {
      versionNumber: 2,
      scenarioPreset: 'budget_reduction_30',
      scenarioTitle: 'Budget Reduction to ₹22,000',
      reason: 'Sponsor funds delayed',
      budgetImpact: -8000,
      approvedByUser: true,
      changesSummary: ['Reduced catering to ₹11,000'],
    },
    revisedEventState
  );

  assert.equal(applied.currentPlanVersion, 2);
  assert.equal(applied.totalBudget, 22000);
  assert.equal(applied.revisions.length, 1);
  const revisionId = applied.revisions[0].id;

  // Rollback to previous state
  const rolledBack = await repo.rollbackPlanRevision(event.id, revisionId);
  assert.equal(rolledBack.totalBudget, 30000, 'Budget restored to original ₹30,000');
  assert.equal(rolledBack.expenses[0].name, 'Original Catering', 'Original allocations restored');
  assert.equal(rolledBack.status, 'planning');
});

test('32. Repository Architecture - Expense, Task, Vendor child CRUD operations', async () => {
  storageMock.clear();
  const repo = new LocalStorageEventRepository();

  const event = await repo.createEvent({
    name: 'Multi-Item Event',
    type: 'family',
    date: '2026-12-25',
    location: 'Community Hall',
    guestCount: 50,
    totalBudget: 20000,
    venuePreference: 'indoor',
    status: 'planning',
    expenses: [],
    tasks: [],
    vendors: [],
  });

  // Add Expense
  const expense = await repo.addExpense(event.id, {
    category: 'decor',
    name: 'Balloons & Welcome Arch',
    allocatedAmount: 2000,
    actualAmount: 0,
    paidAmount: 0,
    priority: 'flexible',
    isModifiedByPlanB: false,
  });
  assert.equal(expense.name, 'Balloons & Welcome Arch');

  // Add Task
  const task = await repo.addTask(event.id, {
    title: 'Order flower garlands',
    description: 'Call local florist',
    category: 'decor',
    dueDate: '2026-12-24',
    priority: 'high',
    status: 'pending',
    isUrgent: false,
    isAffectedByPlanB: false,
  });
  assert.equal(task.title, 'Order flower garlands');

  // Add Vendor
  const vendor = await repo.addVendor(event.id, {
    name: 'Shree Decorators',
    category: 'decor',
    quotedAmount: 1800,
    status: 'contacted',
    contactPerson: 'Mr. Manoj',
    phone: '9820011223',
    email: 'shree@decor.com',
    notes: 'Advance needed 1 week prior',
    bookingVerified: false,
  });
  assert.equal(vendor.name, 'Shree Decorators');

  // Verify parent event has all 3 children
  const refreshed = await repo.getEventById(event.id);
  assert.equal(refreshed?.expenses.length, 1);
  assert.equal(refreshed?.tasks.length, 1);
  assert.equal(refreshed?.vendors.length, 1);

  // Delete children
  await repo.deleteExpense(event.id, expense.id);
  await repo.deleteTask(event.id, task.id);
  await repo.deleteVendor(event.id, vendor.id);

  const cleared = await repo.getEventById(event.id);
  assert.equal(cleared?.expenses.length, 0);
  assert.equal(cleared?.tasks.length, 0);
  assert.equal(cleared?.vendors.length, 0);
});
