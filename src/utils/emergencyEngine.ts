import type { EmergencySolution, EmergencyActionItem } from '../types/index.ts';

/**
 * Intelligent deterministic emergency triage engine
 * Produces prioritized mitigation checklists for last-minute event disruptions
 */
export function generateEmergencySolution(
  issue: string,
  hoursRemaining: number,
  availableBudgetINR: number
): EmergencySolution {
  const issueLower = issue.toLowerCase();
  let triagePriority: 'CRITICAL' | 'HIGH' | 'MODERATE' = 'HIGH';

  if (hoursRemaining <= 4) {
    triagePriority = 'CRITICAL';
  } else if (hoursRemaining > 24) {
    triagePriority = 'MODERATE';
  }

  const actions: EmergencyActionItem[] = [];
  let contingencyAdvice = '';

  if (issueLower.includes('cater') || issueLower.includes('food') || issueLower.includes('chef')) {
    actions.push(
      {
        id: 'emg-act-1',
        phase: 'Immediate (0-60 mins)',
        action: 'Lock in headcounts and order high-volume pre-packaged meal boxes or rolls from a commercial franchise kitchen (e.g. Haldiram’s / Faasos / Subway).',
        owner: 'Food Committee Lead',
        costImpactINR: Math.min(availableBudgetINR, 7500),
        isUnverifiedSample: true, // Clearly marked as unverified sample
      },
      {
        id: 'emg-act-2',
        phase: 'Immediate (0-60 mins)',
        action: 'Dispatch 2 volunteers with card/cash directly to store to supervise packaging and pickup.',
        owner: 'Operations Volunteer',
        costImpactINR: 500,
        isUnverifiedSample: false,
      },
      {
        id: 'emg-act-3',
        phase: 'Secondary (1-3 hours)',
        action: 'Deploy self-service drinks table with large beverage dispensers rather than individual waitstaff service.',
        owner: 'Beverage Lead',
        costImpactINR: 1000,
        isUnverifiedSample: false,
      },
      {
        id: 'emg-act-4',
        phase: 'Mitigation / Alternatives',
        action: 'Send polite SMS announcement adjusting serving time window to give backup kitchen a 30-minute buffer.',
        owner: 'Communications Lead',
        costImpactINR: 0,
        isUnverifiedSample: false,
      }
    );
    contingencyAdvice = 'Emergency Food Protocol: Do not try to hire a replacement traditional buffet caterer under 6 hours. Switch entirely to sealed combo boxes; this eliminates plates, chafer trays, and heating requirements.';
  } else if (issueLower.includes('sound') || issueLower.includes('mic') || issueLower.includes('speaker') || issueLower.includes('audio') || issueLower.includes('dj')) {
    actions.push(
      {
        id: 'emg-act-1',
        phase: 'Immediate (0-60 mins)',
        action: 'Audit local backup gear: source portable high-wattage battery PA speaker (e.g. JBL PartyBox 310) from nearby rental or student council store.',
        owner: 'Technical Coordinator',
        costImpactINR: Math.min(availableBudgetINR, 2500),
        isUnverifiedSample: true,
      },
      {
        id: 'emg-act-2',
        phase: 'Immediate (0-60 mins)',
        action: 'Check AUX / Bluetooth cables, XLR audio adapters, and ensure wired dynamic microphone is tested as primary backup.',
        owner: 'Sound Assistant',
        costImpactINR: 300,
        isUnverifiedSample: false,
      },
      {
        id: 'emg-act-3',
        phase: 'Secondary (1-3 hours)',
        action: 'Pre-load all performance tracks and speeches onto two separate offline smartphones/laptops (avoid streaming reliance).',
        owner: 'DJ / MC',
        costImpactINR: 0,
        isUnverifiedSample: false,
      },
      {
        id: 'emg-act-4',
        phase: 'Mitigation / Alternatives',
        action: 'Re-orient stage layout toward natural acoustic sweet-spots in the hall to maximize speech clarity without blasting gain.',
        owner: 'Stage Manager',
        costImpactINR: 0,
        isUnverifiedSample: false,
      }
    );
    contingencyAdvice = 'Emergency Audio Protocol: Prioritize vocal clarity for speeches and announcements first. Music can be driven from portable party speakers if main amp arrays fail.';
  } else if (issueLower.includes('rain') || issueLower.includes('weather') || issueLower.includes('venue') || issueLower.includes('hall')) {
    actions.push(
      {
        id: 'emg-act-1',
        phase: 'Immediate (0-60 mins)',
        action: 'Relocate all electrical switchboards, sound consoles, and instruments under shelter immediately.',
        owner: 'Safety Marshall',
        costImpactINR: 0,
        isUnverifiedSample: false,
      },
      {
        id: 'emg-act-2',
        phase: 'Immediate (0-60 mins)',
        action: 'Unlock indoor backup auditorium / seminar hall and switch on AC / ventilation.',
        owner: 'Campus Facility Lead',
        costImpactINR: 1500,
        isUnverifiedSample: true,
      },
      {
        id: 'emg-act-3',
        phase: 'Secondary (1-3 hours)',
        action: 'Re-deploy 100 banquet chairs into lecture-hall or horseshoe formation for indoor viewing.',
        owner: 'Setup Volunteers',
        costImpactINR: 0,
        isUnverifiedSample: false,
      },
      {
        id: 'emg-act-4',
        phase: 'Mitigation / Alternatives',
        action: 'Post directional signage at outdoor entrance leading to indoor hall.',
        owner: 'Signage Lead',
        costImpactINR: 200,
        isUnverifiedSample: false,
      }
    );
    contingencyAdvice = 'Emergency Venue Protocol: Cut high-voltage outdoor lighting immediately when precipitation is detected. Transition to indoor lighting and prioritize attendee safety and dryness.';
  } else {
    // General emergency triage
    actions.push(
      {
        id: 'emg-act-1',
        phase: 'Immediate (0-60 mins)',
        action: `Assemble 3 core organizers to isolate the root cause: "${issue.substring(0, 50)}...". Freeze all non-essential vendor payouts immediately.`,
        owner: 'Lead Organizer',
        costImpactINR: 0,
        isUnverifiedSample: false,
      },
      {
        id: 'emg-act-2',
        phase: 'Immediate (0-60 mins)',
        action: `Allocate emergency petty cash (up to ₹${Math.min(availableBudgetINR, 5000)}) to acquire immediate local stopgap replacements.`,
        owner: 'Treasurer',
        costImpactINR: Math.min(availableBudgetINR, 5000),
        isUnverifiedSample: true,
      },
      {
        id: 'emg-act-3',
        phase: 'Secondary (1-3 hours)',
        action: 'Notify key stakeholders and anchors of schedule adjustments or contingency flow.',
        owner: 'Communications Lead',
        costImpactINR: 0,
        isUnverifiedSample: false,
      },
      {
        id: 'emg-act-4',
        phase: 'Mitigation / Alternatives',
        action: 'Document incident timeline and hold post-event audit for refund claims against default vendors.',
        owner: 'Committee Secretary',
        costImpactINR: 0,
        isUnverifiedSample: false,
      }
    );
    contingencyAdvice = 'Emergency Action Protocol: Focus on guest safety and experience first. Do not attempt complex multi-vendor negotiations during the final countdown hours.';
  }

  return {
    issue,
    hoursRemaining,
    budgetAvailableINR: availableBudgetINR,
    triagePriority,
    actions,
    contingencyAdvice,
  };
}
