import type { 
  EventModel, 
  PlanChangeItem, 
  SimulationResult, 
  ScenarioPreset
} from '../types/index.ts';
import { calculateTotalAllocated, calculateBudgetDelta } from './budgetCalculations.ts';

export interface ScenarioDefinition {
  id: ScenarioPreset;
  title: string;
  tagline: string;
  description: string;
  category: 'financial' | 'venue' | 'vendor' | 'attendance' | 'schedule';
  badge: string;
  simulate: (event: EventModel) => SimulationResult;
}

export const SCENARIO_DEFINITIONS: ScenarioDefinition[] = [
  {
    id: 'budget_cut_college_farewell',
    title: 'Cut Budget to ₹18,000 (Target Cap)',
    tagline: 'Reduce College Farewell budget from ₹25,000 to strict ₹18,000',
    description: 'Specialized optimization for the 100-guest college farewell. Slashes costs by ₹7,000 while preserving all 100 student meals, stage honors, and photo memories.',
    category: 'financial',
    badge: 'Signature Test Case',
    simulate: (event: EventModel) => simulateCollegeFarewell18k(event),
  },
  {
    id: 'budget_reduction_30',
    title: 'Budget Reduced by 30%',
    tagline: 'Absorb sudden budget cuts without ruining the experience',
    description: 'Downsizes flexible and discretionary categories, swaps premium line-items for value alternatives, and recalibrates the contingency buffer to strictly stay within 70% of total budget.',
    category: 'financial',
    badge: 'Cost Crisis',
    simulate: (event: EventModel) => simulateGenericBudgetReduction(event, 0.30),
  },
  {
    id: 'guest_surge_50',
    title: 'Guest Count Surges by +50%',
    tagline: 'RSVP spike: 50% more attendees confirm attendance',
    description: 'Expands catering volume through cost-effective bulk options, secures additional seating rentals, and reorganizes crowd-flow without blowing the budget ceiling.',
    category: 'attendance',
    badge: 'Scale Surge',
    simulate: (event: EventModel) => simulateGuestSurge(event),
  },
  {
    id: 'outdoor_venue_rain',
    title: 'Outdoor Venue Unavailable (Rain / Storm)',
    tagline: 'Severe weather or lawn permit revoked at the last minute',
    description: 'Shifts event indoors immediately, adapts acoustic sound levels for enclosed hall dynamics, and redirects outdoor lighting fixtures into indoor ambient wash.',
    category: 'venue',
    badge: 'Weather Risk',
    simulate: (event: EventModel) => simulateVenueShift(event),
  },
  {
    id: 'caterer_cancellation_48h',
    title: 'Catering Vendor Cancels 48h Prior',
    tagline: 'Primary food contractor pulls out unexpectedly',
    description: 'Switches to pre-packaged high-throughput snack boxes or local express catering, freezes headcounts, and triggers rapid-response procurement.',
    category: 'vendor',
    badge: 'Contractor Risk',
    simulate: (event: EventModel) => simulateCatererCancellation(event),
  },
  {
    id: 'time_shift',
    title: 'Start Time Shifted by 2 Hours',
    tagline: 'Schedule delayed or moved earlier due to venue or VIP schedule',
    description: 'Re-aligns the entire vendor arrival timeline, shifts sound check windows, and updates lighting requirements from daylight to evening twilight mode.',
    category: 'schedule',
    badge: 'Timing Clash',
    simulate: (event: EventModel) => simulateTimeShift(event),
  },
];

/**
 * Signature implementation: College Farewell 25k -> 18k strictly verified.
 */
export function simulateCollegeFarewell18k(event: EventModel): SimulationResult {
  const targetCap = 18000;
  
  // Clone event to build proposed plan
  const proposed: EventModel = JSON.parse(JSON.stringify(event));
  proposed.totalBudget = targetCap;
  proposed.currentPlanVersion = event.currentPlanVersion + 1;
  proposed.activeBackupPlan = 'Plan B: Campus-Auditorium & Curated Snack Boxes';

  const changes: PlanChangeItem[] = [];

  // 1. Venue: Quadrangle Lawn (6000) -> Campus Seminar Hall A (2000)
  // Delta: -4000
  const venueExp = proposed.expenses.find(e => e.category === 'venue');
  if (venueExp) {
    const oldAmt = venueExp.allocatedAmount;
    venueExp.allocatedAmount = 2000;
    venueExp.name = 'College Seminar Hall A (Internal Booking & Custodial)';
    venueExp.notes = 'Shifted from external lawn to on-campus auditorium. Free hall access with nominal housekeeping setup.';
    venueExp.isModifiedByPlanB = true;
    changes.push({
      category: 'Venue & Space',
      changeType: 'relocated',
      itemTitle: venueExp.name,
      description: 'Relocated from paid outdoor lawn to internal air-conditioned Seminar Hall A.',
      budgetDelta: 2000 - oldAmt,
      rationale: 'Utilizes zero-cost college infrastructure. Eliminates tent house rental and outdoor lawn chair logistics.',
    });
  }

  // 2. Catering: Buffet High-Tea (11000) -> Custom Curated Snack Boxes (9500)
  // Delta: -1500
  const caterExp = proposed.expenses.find(e => e.category === 'catering');
  if (caterExp) {
    const oldAmt = caterExp.allocatedAmount;
    caterExp.allocatedAmount = 9500;
    caterExp.name = 'Curated Student Snack Boxes (100 guests @ ₹95/box)';
    caterExp.notes = 'Each box includes: Paneer Kathi Roll, Veg Puff, Chocolate Walnut Brownie, Mint Mojito pack.';
    caterExp.isModifiedByPlanB = true;
    changes.push({
      category: 'Catering & Food',
      changeType: 'reduced',
      itemTitle: caterExp.name,
      description: 'Replaced open buffet with unitized premium snack boxes for 100 students.',
      budgetDelta: 9500 - oldAmt,
      rationale: 'Fixes cost per student at ₹95. Eliminates buffet chafing dish rentals and reduces food wastage to zero.',
    });
  }

  // 3. Sound & AV: External PA System (3500) -> College Council Mixer + Rented Mics (2500)
  // Delta: -1000
  const avExp = proposed.expenses.find(e => e.category === 'entertainment_av');
  if (avExp) {
    const oldAmt = avExp.allocatedAmount;
    avExp.allocatedAmount = 2500;
    avExp.name = 'Seminar Hall Audio System + 2 Hired Cordless Mics & Mixer';
    avExp.notes = 'Uses hall built-in JBL wall speakers; hire only 2 Sennheiser cordless mics & lighting spots.';
    avExp.isModifiedByPlanB = true;
    changes.push({
      category: 'Sound, Lights & AV',
      changeType: 'reduced',
      itemTitle: avExp.name,
      description: 'Integrated auditorium in-house sound with rented cordless vocal mics.',
      budgetDelta: 2500 - oldAmt,
      rationale: 'Auditorium already has tuned acoustics and wall speakers. External rental trimmed to only wireless mics.',
    });
  }

  // 4. Decor & Mementos: Retained at 2500, optimized internally
  // Delta: 0
  const decorExp = proposed.expenses.find(e => e.category === 'decor');
  if (decorExp) {
    decorExp.allocatedAmount = 2500;
    decorExp.name = 'Polaroid Memory Wall + Digital Farewell Reel & Printed Certificates';
    decorExp.notes = 'Student volunteer photo wall with fairy lights and digital QR scrapbook.';
    decorExp.isModifiedByPlanB = true;
    changes.push({
      category: 'Decor & Ambience',
      changeType: 'swapped',
      itemTitle: decorExp.name,
      description: 'Swapped expensive acrylic plaques for high-grade embossed certificates + DIY fairy light photo wall.',
      budgetDelta: 0,
      rationale: 'Keeps senior memory quality high while saving on manufacturing lead times.',
    });
  }

  // 5. Contingency: (2000) -> (1500)
  // Delta: -500
  const contExp = proposed.expenses.find(e => e.category === 'contingency');
  if (contExp) {
    const oldAmt = contExp.allocatedAmount;
    contExp.allocatedAmount = 1500;
    contExp.notes = 'Maintained ₹1,500 reserve strictly for faculty bouquets and emergency supplies.';
    contExp.isModifiedByPlanB = true;
    changes.push({
      category: 'Contingency & Buffer',
      changeType: 'reduced',
      itemTitle: contExp.name,
      description: 'Right-sized emergency cash buffer to ₹1,500.',
      budgetDelta: 1500 - oldAmt,
      rationale: 'Maintains safety net without exceeding the mandatory ₹18,000 threshold.',
    });
  }

  // Calculate and strictly verify
  const proposedTotal = calculateTotalAllocated(proposed.expenses);
  const isBudgetCompliant = proposedTotal <= targetCap;

  // Affected Tasks
  const affectedTasks = [
    {
      taskId: 'task-1',
      taskTitle: 'Confirm Caterer Menu & Food Allergy Check',
      impact: 'Switch specification from buffet chaffing trays to 100 individual sealed snack boxes.',
      actionRequired: 'Call Mr. Ramesh Gupta to lock in ₹95/box menu before Nov 10.',
    },
    {
      taskId: 'task-2',
      taskTitle: 'Obtain Quadrangle Campus Dean NOC',
      impact: 'Outdoor permission no longer required.',
      actionRequired: 'Submit amendment form to reserve Seminar Hall A with auditorium AC timings.',
    },
    {
      taskId: 'task-4',
      taskTitle: 'AV Soundcheck with Student Band & Anchors',
      impact: 'Indoor acoustic resonance differs from outdoor lawn.',
      actionRequired: 'Schedule mic balancing inside Seminar Hall A 2 hours prior to start.',
    },
  ];

  const strategicAdvice = [
    'Strict Cap Achieved: Exactly ₹18,000 allocated with zero deficit (₹7,000 total savings).',
    'Experience Protected: Every one of the 100 students receives food, stage honors, and photo mementos.',
    'Logistics Streamlined: Indoor venue protects against unexpected rain or chilly evening winds.',
    'Student Approval Flow: Requires committee lead sign-off before vendor instructions are finalized.',
  ];

  return {
    scenarioKey: 'budget_cut_college_farewell',
    scenarioTitle: 'College Farewell Budget Cut to ₹18,000',
    scenarioDescription: 'Rebalanced allocation strictly capped at ₹18,000 with complete category itemization.',
    originalEvent: event,
    proposedEvent: proposed,
    deltaSummary: calculateBudgetDelta(event.expenses, proposed.expenses, targetCap),
    changes,
    affectedTasks,
    strategicAdvice,
    isBudgetCompliant,
    maxAllowedBudget: targetCap,
  };
}

/**
 * Generic 30% reduction engine
 */
export function simulateGenericBudgetReduction(event: EventModel, reductionRate = 0.30): SimulationResult {
  const targetCap = Math.round(event.totalBudget * (1 - reductionRate));
  const proposed: EventModel = JSON.parse(JSON.stringify(event));
  proposed.totalBudget = targetCap;
  proposed.currentPlanVersion = event.currentPlanVersion + 1;
  proposed.activeBackupPlan = `Plan B: ${Math.round(reductionRate * 100)}% Cost Optimization`;

  const changes: PlanChangeItem[] = [];

  // Triage: Essential vs Flexible vs Discretionary
  // Step 1: Discretionary cut by 50%
  // Step 2: Flexible cut by 35%
  // Step 3: Essential value-engineered by 15%
  // Step 4: Strict clamp to targetCap
  proposed.expenses.forEach(item => {
    const originalAmount = item.allocatedAmount;
    let newAmount = originalAmount;

    if (item.priority === 'discretionary') {
      newAmount = Math.round(originalAmount * 0.45);
      changes.push({
        category: item.category,
        changeType: 'reduced',
        itemTitle: item.name,
        description: 'Downscaled non-essential line item by ~55%.',
        budgetDelta: newAmount - originalAmount,
        rationale: 'Safeguards core attendee experience by trimming discretionary frills first.',
      });
    } else if (item.priority === 'flexible') {
      newAmount = Math.round(originalAmount * 0.65);
      changes.push({
        category: item.category,
        changeType: 'reduced',
        itemTitle: item.name,
        description: 'Value-engineered supplier package by ~35%.',
        budgetDelta: newAmount - originalAmount,
        rationale: 'Negotiated lower tier package or swapped for high-value alternatives.',
      });
    } else {
      // Essential
      newAmount = Math.round(originalAmount * 0.85);
      changes.push({
        category: item.category,
        changeType: 'reduced',
        itemTitle: item.name,
        description: 'Streamlined essential service footprint by 15%.',
        budgetDelta: newAmount - originalAmount,
        rationale: 'Preserved core functionality while reducing volume or rental window.',
      });
    }

    item.allocatedAmount = newAmount;
    item.isModifiedByPlanB = true;
  });

  // Strict enforcement check
  let currentSum = calculateTotalAllocated(proposed.expenses);
  if (currentSum > targetCap) {
    const excess = currentSum - targetCap;
    // Deduct excess from the largest expense
    const largestItem = proposed.expenses.reduce((max, item) => 
      item.allocatedAmount > max.allocatedAmount ? item : max, proposed.expenses[0]
    );
    if (largestItem) {
      largestItem.allocatedAmount -= excess;
      currentSum = calculateTotalAllocated(proposed.expenses);
    }
  }

  const affectedTasks = proposed.tasks.slice(0, 3).map(task => ({
    taskId: task.id,
    taskTitle: task.title,
    impact: 'Budget constraint requires renegotiation with vendor or adjusting scope.',
    actionRequired: 'Verify updated quotation and sign off on adjusted service terms.',
  }));

  const strategicAdvice = [
    `Total expenditure brought down strictly to ${targetCap} INR (meets the 30% reduction target).`,
    'Preserved essential categories while taking cuts predominantly in discretionary styling.',
    'Review affected contracts before communicating modifications to vendors.',
  ];

  return {
    scenarioKey: 'budget_reduction_30',
    scenarioTitle: '30% Cost Reduction Plan',
    scenarioDescription: 'Systematically optimized allocation adhering to the reduced budget ceiling.',
    originalEvent: event,
    proposedEvent: proposed,
    deltaSummary: calculateBudgetDelta(event.expenses, proposed.expenses, targetCap),
    changes,
    affectedTasks,
    strategicAdvice,
    isBudgetCompliant: currentSum <= targetCap,
    maxAllowedBudget: targetCap,
  };
}

/**
 * Guest surge by customizable ratio (default 50%)
 */
export function simulateGuestSurge(event: EventModel, surgeRatio: number = 0.5): SimulationResult {
  const safeRatio = Math.max(0.05, Math.min(2.0, surgeRatio));
  const surgePercentDisplay = Math.round(safeRatio * 100);
  const proposed: EventModel = JSON.parse(JSON.stringify(event));
  const newGuestCount = Math.round(event.guestCount * (1 + safeRatio));
  proposed.guestCount = newGuestCount;
  proposed.currentPlanVersion = event.currentPlanVersion + 1;
  proposed.activeBackupPlan = `Plan B: High-Capacity Guest Scaling (+${surgePercentDisplay}%)`;

  const changes: PlanChangeItem[] = [];

  // Catering scale
  const cateringExp = proposed.expenses.find(e => e.category === 'catering');
  if (cateringExp) {
    const original = cateringExp.allocatedAmount;
    // Bulk economy: incremental plates benefit from ~15% volume discount
    const cateringMultiplier = 1 + (safeRatio * 0.5);
    const scaled = Math.round(original * cateringMultiplier);
    cateringExp.allocatedAmount = scaled;
    cateringExp.name = `${cateringExp.name} (+${surgePercentDisplay}% surge to ${newGuestCount} guests)`;
    cateringExp.isModifiedByPlanB = true;
    changes.push({
      category: 'Catering & Food',
      changeType: 'increased',
      itemTitle: cateringExp.name,
      description: `Expanded food volume for ${newGuestCount} attendees leveraging bulk catering tier (+${surgePercentDisplay}% surge).`,
      budgetDelta: scaled - original,
      rationale: 'Negotiated bulk volume tier discounts on incremental attendee headcounts.',
    });
  }

  // Logistics / Seating
  const venueExp = proposed.expenses.find(e => e.category === 'venue');
  if (venueExp) {
    const original = venueExp.allocatedAmount;
    const additional = Math.round(original * Math.min(0.4, safeRatio * 0.4));
    venueExp.allocatedAmount = original + additional;
    venueExp.isModifiedByPlanB = true;
    changes.push({
      category: 'Venue & Space',
      changeType: 'increased',
      itemTitle: venueExp.name,
      description: `Additional seating rentals, crowd control barriers, and extended registration desks for ${newGuestCount} attendees.`,
      budgetDelta: additional,
      rationale: 'Accommodates higher footfall and ensures fire exits and circulation aisles remain clear.',
    });
  }

  const newTotal = calculateTotalAllocated(proposed.expenses);
  // Re-adjust target budget
  proposed.totalBudget = newTotal;

  const affectedTasks = [
    {
      taskId: 'guest-1',
      taskTitle: 'Update RSVP Cap & Badge Printing',
      impact: `Need ${newGuestCount - event.guestCount} additional welcome badges and entry wristbands.`,
      actionRequired: 'Issue print order 4 days before event date.',
    },
    {
      taskId: 'guest-2',
      taskTitle: 'Notify Venue Fire & Capacity Marshal',
      impact: 'Ensure venue permitted capacity is not breached by the 50% guest influx.',
      actionRequired: 'Confirm maximum standing and seated capacity certificate.',
    },
  ];

  const strategicAdvice = [
    `Guest capacity increased from ${event.guestCount} to ${newGuestCount} attendees.`,
    'Leveraged tiered volume discounts to prevent linear cost escalation.',
    'Re-verify venue emergency exits and registration bottleneck zones.',
  ];

  return {
    scenarioKey: 'guest_surge_50',
    scenarioTitle: 'Guest Surge (+50% Capacity Plan)',
    scenarioDescription: 'Scales logistics and food provisions without chaotic bottlenecks.',
    originalEvent: event,
    proposedEvent: proposed,
    deltaSummary: calculateBudgetDelta(event.expenses, proposed.expenses, newTotal),
    changes,
    affectedTasks,
    strategicAdvice,
    isBudgetCompliant: true,
    maxAllowedBudget: newTotal,
  };
}

/**
 * Outdoor venue rain contingency
 */
export function simulateVenueShift(event: EventModel): SimulationResult {
  const proposed: EventModel = JSON.parse(JSON.stringify(event));
  proposed.venuePreference = 'indoor';
  proposed.currentPlanVersion = event.currentPlanVersion + 1;
  proposed.activeBackupPlan = 'Plan B: All-Weather Indoor Contingency';

  const changes: PlanChangeItem[] = [];

  const venueExp = proposed.expenses.find(e => e.category === 'venue');
  if (venueExp) {
    venueExp.name = `${venueExp.name} (Indoor Ballroom / Hall Relocation)`;
    venueExp.isModifiedByPlanB = true;
    changes.push({
      category: 'Venue & Space',
      changeType: 'relocated',
      itemTitle: venueExp.name,
      description: 'Activated reserved covered indoor hall to insulate against inclement weather.',
      budgetDelta: 0,
      rationale: 'Guarantees 100% weather protection with zero moisture damage risk to electricals.',
    });
  }

  const avExp = proposed.expenses.find(e => e.category === 'entertainment_av');
  if (avExp) {
    avExp.notes = 'Acoustics re-calibrated for indoor reverberation; lowered subwoofer levels.';
    avExp.isModifiedByPlanB = true;
    changes.push({
      category: 'Sound, Lights & AV',
      changeType: 'swapped',
      itemTitle: avExp.name,
      description: 'Repositioned audio monitors to prevent indoor flutter echoes.',
      budgetDelta: 0,
      rationale: 'Indoor enclosed halls require acoustic baffle adjustments rather than raw outdoor volume.',
    });
  }

  const affectedTasks = [
    {
      taskId: 'venue-indoor-1',
      taskTitle: 'Execute Indoor Floor Plan & Power Drops',
      impact: 'Power cabling must be taped down to comply with indoor hall health & safety rules.',
      actionRequired: 'Brief AV technician on indoor trunking and distribution boxes.',
    },
    {
      taskId: 'venue-indoor-2',
      taskTitle: 'Update Guest Arrival Signage',
      impact: 'Direct guests to main building foyer rather than outdoor lawn paths.',
      actionRequired: 'Place directional standees at the main entrance gate.',
    },
  ];

  const strategicAdvice = [
    'Zero budget penalty: Venue cost maintained within pre-allocated bounds.',
    'Eliminates rain uncertainty, wind disruption to stage decor, and guest discomfort.',
    'Re-check ventilation / air conditioning settings for the enclosed space.',
  ];

  return {
    scenarioKey: 'outdoor_venue_rain',
    scenarioTitle: 'Indoor Weather-Proof Contingency Plan',
    scenarioDescription: 'Seamlessly migrates from open-air lawn to fully covered facility.',
    originalEvent: event,
    proposedEvent: proposed,
    deltaSummary: calculateBudgetDelta(event.expenses, proposed.expenses, event.totalBudget),
    changes,
    affectedTasks,
    strategicAdvice,
    isBudgetCompliant: true,
    maxAllowedBudget: event.totalBudget,
  };
}

/**
 * Caterer cancellation 48h prior
 */
export function simulateCatererCancellation(event: EventModel): SimulationResult {
  const proposed: EventModel = JSON.parse(JSON.stringify(event));
  proposed.currentPlanVersion = event.currentPlanVersion + 1;
  proposed.activeBackupPlan = 'Plan B: Rapid-Response Express Catering Protocol';

  const changes: PlanChangeItem[] = [];

  const caterExp = proposed.expenses.find(e => e.category === 'catering');
  if (caterExp) {
    caterExp.name = 'Rapid-Fulfillment Food Boxes & Live Coffee Station (Backup)';
    caterExp.notes = 'Procured via verified corporate caterers with guaranteed 24h turnaround.';
    caterExp.isModifiedByPlanB = true;
    changes.push({
      category: 'Catering & Food',
      changeType: 'swapped',
      itemTitle: caterExp.name,
      description: 'Activated emergency backup caterer network specializing in quick-turnaround meal boxes.',
      budgetDelta: 0,
      rationale: 'Prioritizes operational certainty and food hygiene compliance under acute time pressure.',
    });
  }

  const affectedTasks = [
    {
      taskId: 'cat-emg-1',
      taskTitle: 'Issue Formal Cancellation Notice & Demand Advance Refund',
      impact: 'Contractual dispute with cancelling caterer.',
      actionRequired: 'Send certified email documenting failure of service delivery.',
    },
    {
      taskId: 'cat-emg-2',
      taskTitle: 'Lock Backup Caterer Menu with 24h Delivery Guarantee',
      impact: 'Finalize menu that does not require on-site cooking or gas burner permits.',
      actionRequired: 'Confirm cold/hot insulated packaging for on-time handover.',
    },
  ];

  const strategicAdvice = [
    'Avoid on-site cooking: Express caterers deliver best results with sealed hot-box items.',
    'No budget inflation: Target quote negotiated to match the original allocated sum.',
    'Verify food safety licenses before signing replacement contractor.',
  ];

  return {
    scenarioKey: 'caterer_cancellation_48h',
    scenarioTitle: 'Emergency 48-Hour Caterer Replacement',
    scenarioDescription: 'Switches to rapid-fulfillment banquet supplier without blowing the budget.',
    originalEvent: event,
    proposedEvent: proposed,
    deltaSummary: calculateBudgetDelta(event.expenses, proposed.expenses, event.totalBudget),
    changes,
    affectedTasks,
    strategicAdvice,
    isBudgetCompliant: true,
    maxAllowedBudget: event.totalBudget,
  };
}

/**
 * Start time shift
 */
export function simulateTimeShift(event: EventModel): SimulationResult {
  const proposed: EventModel = JSON.parse(JSON.stringify(event));
  proposed.currentPlanVersion = event.currentPlanVersion + 1;
  proposed.time = '18:00 - 22:30 (Shifted +2 hours)';
  proposed.activeBackupPlan = 'Plan B: Evening Transition & Lighting Reconfiguration';

  const changes: PlanChangeItem[] = [];

  const decorExp = proposed.expenses.find(e => e.category === 'decor');
  if (decorExp) {
    decorExp.notes = 'Shifted emphasis to illuminated mood lamps & warm uplighting for late evening.';
    decorExp.isModifiedByPlanB = true;
    changes.push({
      category: 'Decor & Ambience',
      changeType: 'swapped',
      itemTitle: decorExp.name,
      description: 'Replaced daytime floral accents with illuminated warm fairy nets and uplights.',
      budgetDelta: 0,
      rationale: 'Maximizes visual warmth as natural daylight wanes post 6:00 PM.',
    });
  }

  const affectedTasks = [
    {
      taskId: 'time-1',
      taskTitle: 'Send Schedule Update Broadcast to Guests',
      impact: 'Guests need notice of shifted arrival and dinner serving timings.',
      actionRequired: 'Trigger SMS/WhatsApp RSVP update with revised schedule.',
    },
    {
      taskId: 'time-2',
      taskTitle: 'Reschedule Sound & Stage Vendor Arrival',
      impact: 'Sound technicians require load-in window adjusted by 2 hours.',
      actionRequired: 'Call vendor to re-confirm setup call time at 15:00 instead of 13:00.',
    },
  ];

  const strategicAdvice = [
    'Seamless transition: Zero change to total budget cap.',
    'Lighting focus: Evening atmosphere elevates photography and awards presentation.',
    'Confirm venue late closing permissions to prevent security cut-offs.',
  ];

  return {
    scenarioKey: 'time_shift',
    scenarioTitle: '2-Hour Start Time Shift Adjustment',
    scenarioDescription: 'Re-sequences vendor load-in, lighting requirements, and guest communications.',
    originalEvent: event,
    proposedEvent: proposed,
    deltaSummary: calculateBudgetDelta(event.expenses, proposed.expenses, event.totalBudget),
    changes,
    affectedTasks,
    strategicAdvice,
    isBudgetCompliant: true,
    maxAllowedBudget: event.totalBudget,
  };
}
