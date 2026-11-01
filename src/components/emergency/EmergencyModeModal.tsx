import React, { useState } from 'react';
import { useEvent } from '../../context/EventContext';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Send,
  Copy
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { generateEmergencySolution } from '../../utils/emergencyEngine';
import { EmergencySolution } from '../../types';
import { formatINR } from '../../utils/budgetCalculations';

export const EmergencyModeModal: React.FC = () => {
  const { isEmergencyModalOpen, closeEmergencyModal, showToast } = useEvent();

  const [issueDescription, setIssueDescription] = useState('Catering vendor says delivery van broke down 3 hours before start time');
  const [hoursRemaining, setHoursRemaining] = useState(3);
  const [availableEmergencyBudget, setAvailableEmergencyBudget] = useState(5000);
  const [solution, setSolution] = useState<EmergencySolution | null>(null);
  const [isTriageRunning, setIsTriageRunning] = useState(false);

  const presets = [
    {
      label: '🥘 Caterer No-Show',
      desc: 'Catering vendor cancelled or vehicle broke down 3 hours before event.',
      hours: 3,
      budget: 6000
    },
    {
      label: '🌧️ Sudden Lawn Rainout',
      desc: 'Heavy thunderstorm over outdoor venue lawn; electrical stage gear at risk.',
      hours: 2,
      budget: 3000
    },
    {
      label: '🔊 Audio / Mic Failure',
      desc: 'Main sound amplifier blown; microphones not working for acoustic band.',
      hours: 1.5,
      budget: 2500
    },
    {
      label: '👥 50 Extra Guests Walk-in',
      desc: '50 unexpected walk-in attendees; food plates and chairs falling short.',
      hours: 4,
      budget: 7000
    }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setIssueDescription(p.desc);
    setHoursRemaining(p.hours);
    setAvailableEmergencyBudget(p.budget);
  };

  const handleRunTriage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDescription.trim()) return;

    setIsTriageRunning(true);
    const sol = generateEmergencySolution(
      issueDescription.trim(),
      Number(hoursRemaining) || 1,
      Number(availableEmergencyBudget) || 0
    );
    setSolution(sol);
    setIsTriageRunning(false);
  };

  const handleReset = () => {
    setSolution(null);
  };

  // Copy checklist to clipboard for WhatsApp sharing
  const handleCopyChecklist = () => {
    if (!solution) return;
    const lines = [
      `🚨 EMERGENCY ACTION PROTOCOL: ${solution.triagePriority} PRIORITY`,
      `Crisis: ${solution.issue}`,
      `Time Remaining: ${solution.hoursRemaining} Hours | Available Petty Cash: ${formatINR(solution.budgetAvailableINR)}`,
      ``,
      `COMMANDER DIRECTIVE:`,
      solution.contingencyAdvice,
      ``,
      `TACTICAL ACTIONS:`,
      ...solution.actions.map(a => `[${a.phase}] ${a.action} (Owner: ${a.owner})`),
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    showToast('success', 'Checklist Copied!', 'Emergency triage checklist copied to clipboard for team chat.');
  };

  return (
    <Modal
      isOpen={isEmergencyModalOpen}
      onClose={closeEmergencyModal}
      title="Emergency Crisis Triage"
      subtitle="Rapid-response contingency protocol for last-minute disruptions."
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Notice of integrity */}
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-950 flex items-start gap-3 shadow-subtle">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Rapid Response Guarantee:</span>
            <p className="leading-relaxed">
              PlanB AI provides deterministic contingency actions based on industry event management playbooks. Commercial suggestions are unverified recommendations; call providers directly to confirm.
            </p>
          </div>
        </div>

        {!solution ? (
          /* Crisis Input Form */
          <form onSubmit={handleRunTriage} className="space-y-5">
            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-charcoal-500 uppercase tracking-wider block">
                Quick Preset Crises (1-Click Fill)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="p-2.5 rounded-xl border border-charcoal-200 bg-charcoal-50/60 hover:bg-violet-50 hover:border-violet-300 text-left text-xs font-semibold text-charcoal-800 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-charcoal-900 block">
                Describe the unexpected disruption *
              </label>
              <textarea
                required
                rows={3}
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="e.g. Heavy unexpected thunderstorm started over the lawn / Sound system mixer blew a fuse / Caterer cancelled..."
                className="w-full px-4 py-3 rounded-2xl border border-charcoal-200 text-sm focus:outline-none focus:border-rose-600 focus:ring-2 focus:ring-rose-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-charcoal-900 block">
                  Time Remaining to Event Start (Hours)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    max="72"
                    value={hoursRemaining}
                    onChange={(e) => setHoursRemaining(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-bold focus:outline-none focus:border-rose-600"
                  />
                  <span className="absolute right-4 top-3 text-xs text-charcoal-400 font-semibold">
                    Hours
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-charcoal-900 block">
                  Available Emergency Petty Cash (₹ INR)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={availableEmergencyBudget}
                    onChange={(e) => setAvailableEmergencyBudget(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-bold focus:outline-none focus:border-rose-600"
                  />
                  <span className="absolute right-4 top-3 text-xs text-charcoal-500 font-bold">
                    ₹ INR
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-charcoal-100">
              <button
                type="button"
                onClick={closeEmergencyModal}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-charcoal-600 hover:bg-charcoal-100"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isTriageRunning}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-700 hover:bg-rose-800 shadow-card transition-all hover:scale-[1.01]"
              >
                <Send className="w-4 h-4" />
                <span>Formulate Action Protocol</span>
              </button>
            </div>
          </form>
        ) : (
          /* Triage Results View */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={solution.triagePriority === 'CRITICAL' ? 'rose' : 'amber'} size="sm">
                    {solution.triagePriority} PRIORITY
                  </Badge>
                  <span className="text-xs text-charcoal-500 font-medium">
                    Countdown: {solution.hoursRemaining} Hours Left
                  </span>
                </div>
                <h3 className="text-lg font-black text-charcoal-900 mt-1">
                  Incident Action Plan
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyChecklist}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-charcoal-700 bg-charcoal-100 hover:bg-charcoal-200 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy for WhatsApp</span>
                </button>
                <button
                  onClick={handleReset}
                  className="text-xs text-violet-700 font-bold hover:underline"
                >
                  Edit Inputs
                </button>
              </div>
            </div>

            {/* Strategic Advice Banner */}
            <div className="p-4 bg-charcoal-900 text-white rounded-2xl text-xs sm:text-sm space-y-1">
              <span className="font-bold text-violet-300 block">Senior Commander Protocol:</span>
              <p className="text-charcoal-200 leading-relaxed">{solution.contingencyAdvice}</p>
            </div>

            {/* Action Items Checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-charcoal-400 uppercase tracking-wider">
                Prioritized Tactical Checklist
              </h4>

              <div className="space-y-2.5">
                {solution.actions.map((act) => (
                  <div
                    key={act.id}
                    className="p-4 rounded-2xl border border-charcoal-200 bg-white shadow-subtle space-y-2 hover:border-violet-300 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-600 bg-charcoal-100 px-2.5 py-0.5 rounded-md">
                        {act.phase}
                      </span>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-charcoal-500">Lead: <strong>{act.owner}</strong></span>
                        {act.costImpactINR > 0 && (
                          <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                            Est: ~{formatINR(act.costImpactINR)}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-charcoal-800 font-medium leading-relaxed">
                      {act.action}
                    </p>

                    {act.isUnverifiedSample && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Sample / Unverified recommendation. Please call vendor directly to check availability.</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-charcoal-100">
              <span className="text-xs text-charcoal-500">
                Authorized Emergency Budget: <strong>{formatINR(solution.budgetAvailableINR)}</strong>
              </span>

              <button
                onClick={closeEmergencyModal}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-charcoal-900 hover:bg-black shadow-subtle"
              >
                Done / Return to Workspace
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
