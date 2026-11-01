import React, { useState } from 'react';
import { useEvent } from '../../context/EventContext';
import { 
  SCENARIO_DEFINITIONS, 
  ScenarioDefinition,
  simulateGenericBudgetReduction,
  simulateGuestSurge
} from '../../utils/scenarioEngine';
import { SimulationResult } from '../../types';
import { 
  CheckCircle2, 
  RotateCcw, 
  Check, 
  ShieldCheck, 
  TrendingDown, 
  TrendingUp, 
  History, 
  AlertTriangle,
  Copy,
  Sliders
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { formatINR, CATEGORY_LABELS } from '../../utils/budgetCalculations';

export const WhatIfSimulator: React.FC = () => {
  const { 
    activeEvent, 
    applyPlanRevision, 
    rollbackPlanRevision,
    showToast 
  } = useEvent();

  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    activeEvent?.id === 'evt-college-farewell-2026' 
      ? 'budget_cut_college_farewell' 
      : 'budget_reduction_30'
  );

  // Custom slider states
  const [customBudgetCutPercent, setCustomBudgetCutPercent] = useState<number>(25);
  const [customGuestSurgePercent, setCustomGuestSurgePercent] = useState<number>(40);

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(() => {
    if (!activeEvent) return null;
    const initialScenario = SCENARIO_DEFINITIONS.find(
      s => s.id === (activeEvent.id === 'evt-college-farewell-2026' ? 'budget_cut_college_farewell' : 'budget_reduction_30')
    ) || SCENARIO_DEFINITIONS[0];
    return initialScenario.simulate(activeEvent);
  });

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  if (!activeEvent) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-charcoal-200">
        <p className="text-charcoal-600">Select an event to run the What If? Simulator</p>
      </div>
    );
  }

  const handleSelectScenario = (scenario: ScenarioDefinition) => {
    setSelectedScenarioId(scenario.id);
    const result = scenario.simulate(activeEvent);
    setSimulationResult(result);
  };

  const handleRunCustomBudgetCut = (percent: number) => {
    setCustomBudgetCutPercent(percent);
    const result = simulateGenericBudgetReduction(activeEvent, percent / 100);
    result.scenarioTitle = `Custom ${percent}% Budget Reduction Plan`;
    result.scenarioDescription = `Automatically adjusted to cap spending within ${100 - percent}% of original budget.`;
    setSimulationResult(result);
  };

  const handleRunCustomGuestSurge = (percent: number) => {
    setCustomGuestSurgePercent(percent);
    const result = simulateGuestSurge(activeEvent);
    result.scenarioTitle = `Custom +${percent}% Guest Surge Plan`;
    result.scenarioDescription = `Scaled logistics and bulk catering to support +${percent}% attendees.`;
    setSimulationResult(result);
  };

  const handleConfirmApply = async () => {
    if (!simulationResult) return;
    setIsApplying(true);
    try {
      await applyPlanRevision(
        {
          scenarioKey: simulationResult.scenarioKey,
          scenarioTitle: simulationResult.scenarioTitle,
          summary: simulationResult.scenarioDescription,
          previousBudget: simulationResult.originalEvent.totalBudget,
          newBudget: simulationResult.proposedEvent.totalBudget,
          changes: simulationResult.changes,
          strategicAdvice: simulationResult.strategicAdvice,
        },
        simulationResult.proposedEvent
      );
      setIsApprovalModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplying(false);
    }
  };

  // Copy Plan B brief to clipboard
  const handleCopySummary = () => {
    if (!simulationResult) return;
    const text = [
      `📋 PLAN B EXECUTIVE BRIEF: ${simulationResult.scenarioTitle}`,
      `Event: ${activeEvent.name}`,
      `Original Budget: ${formatINR(simulationResult.deltaSummary.originalTotal)}`,
      `Proposed Plan B: ${formatINR(simulationResult.deltaSummary.proposedTotal)} (${simulationResult.deltaSummary.difference <= 0 ? formatINR(simulationResult.deltaSummary.difference) : '+' + formatINR(simulationResult.deltaSummary.difference)})`,
      ``,
      `KEY MODIFICATIONS:`,
      ...simulationResult.changes.map(c => `• ${c.category}: ${c.itemTitle} (${c.budgetDelta < 0 ? formatINR(c.budgetDelta) : '+' + formatINR(c.budgetDelta)}) - ${c.rationale}`),
      ``,
      `DIRECT ACTION ITEMS:`,
      ...simulationResult.affectedTasks.map(t => `• ${t.taskTitle}: ${t.actionRequired}`),
    ].join('\n');

    navigator.clipboard.writeText(text);
    showToast('success', 'Summary Copied!', 'Plan B briefing copied to clipboard for team sharing.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-charcoal-900 tracking-tight">What If? Stress-Test Simulator</h1>
            <Badge variant="violet" size="sm" className="font-semibold">Signature Feature</Badge>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500">
            Simulate disruptions, verify financial caps with deterministic code arithmetic, and approve Plan B with one click.
          </p>
        </div>

        {activeEvent.revisions && activeEvent.revisions.length > 0 && (
          <Badge variant="emerald" size="md" className="flex items-center gap-1.5 py-1.5 px-3 self-start md:self-auto font-bold">
            <History className="w-3.5 h-3.5" />
            <span>{activeEvent.revisions.length} Revisions Recorded</span>
          </Badge>
        )}
      </div>

      {/* Mode Tabs: Presets vs Custom Sliders */}
      <div className="flex items-center gap-2 border-b border-charcoal-200 pb-3">
        <button
          onClick={() => setActiveTab('presets')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'presets'
              ? 'bg-violet-800 text-white shadow-card'
              : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100'
          }`}
        >
          Preset Scenarios (6)
        </button>
        <button
          onClick={() => {
            setActiveTab('custom');
            handleRunCustomBudgetCut(customBudgetCutPercent);
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'custom'
              ? 'bg-violet-800 text-white shadow-card'
              : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Custom Scenario Slider</span>
        </button>
      </div>

      {/* Preset Scenarios Grid */}
      {activeTab === 'presets' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SCENARIO_DEFINITIONS.map((scenario) => {
            const isSelected = selectedScenarioId === scenario.id;
            return (
              <div
                key={scenario.id}
                onClick={() => handleSelectScenario(scenario)}
                className={`p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-violet-600 bg-violet-50/40 shadow-card ring-2 ring-violet-600'
                    : 'border-charcoal-200 bg-white hover:border-violet-300 hover:shadow-subtle'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={isSelected ? 'violet' : 'slate'} size="sm">
                    {scenario.badge}
                  </Badge>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-violet-800 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-charcoal-900 mt-2.5">
                  {scenario.title}
                </h3>
                <p className="text-xs text-charcoal-500 mt-1 line-clamp-2 leading-relaxed">
                  {scenario.tagline}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        /* Custom Interactive Sliders */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 bg-white rounded-3xl border border-charcoal-200 shadow-subtle">
          <div className="space-y-3 p-5 rounded-2xl bg-charcoal-50 border border-charcoal-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                Custom Budget Cut
              </span>
              <span className="text-base font-black text-violet-800">
                -{customBudgetCutPercent}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={customBudgetCutPercent}
              onChange={(e) => handleRunCustomBudgetCut(Number(e.target.value))}
              className="w-full accent-violet-800 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-charcoal-400 font-semibold">
              <span>-5% (Minor trimming)</span>
              <span>-50% (Extreme cut)</span>
            </div>
            <p className="text-xs text-charcoal-600 pt-1">
              Simulates slashing budget to {formatINR(Math.round(activeEvent.totalBudget * (1 - customBudgetCutPercent / 100)))}.
            </p>
          </div>

          <div className="space-y-3 p-5 rounded-2xl bg-charcoal-50 border border-charcoal-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                Custom Guest Surge
              </span>
              <span className="text-base font-black text-amber-700">
                +{customGuestSurgePercent}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="10"
              value={customGuestSurgePercent}
              onChange={(e) => handleRunCustomGuestSurge(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-charcoal-400 font-semibold">
              <span>+10% Attendees</span>
              <span>+100% (Double capacity)</span>
            </div>
            <p className="text-xs text-charcoal-600 pt-1">
              Simulates crowd growing to {Math.round(activeEvent.guestCount * (1 + customGuestSurgePercent / 100))} guests.
            </p>
          </div>
        </div>
      )}

      {/* Live Simulation Comparison Workspace */}
      {simulationResult && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-charcoal-200 shadow-card p-6 sm:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-charcoal-100 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-violet-800 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-200">
                    Simulation Outcome
                  </span>
                  <Badge variant={simulationResult.isBudgetCompliant ? 'emerald' : 'rose'} size="sm">
                    {simulationResult.isBudgetCompliant ? 'Cap Compliant' : 'Cap Exceeded'}
                  </Badge>
                </div>
                <h2 className="text-2xl font-black text-charcoal-900">
                  {simulationResult.scenarioTitle}
                </h2>
                <p className="text-xs sm:text-sm text-charcoal-500">
                  {simulationResult.scenarioDescription}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-charcoal-700 bg-charcoal-50 hover:bg-charcoal-100 border border-charcoal-200 transition-colors"
                  title="Copy briefing to clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Brief</span>
                </button>

                <button
                  onClick={() => setIsApprovalModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-violet-800 hover:bg-violet-900 shadow-card transition-all hover:scale-[1.01]"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Approve & Apply Plan B</span>
                </button>
              </div>
            </div>

            {/* Financial Delta Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-charcoal-50/70 border border-charcoal-200">
                <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block">
                  Original Budget
                </span>
                <div className="text-2xl font-black text-charcoal-900 mt-1">
                  {formatINR(simulationResult.deltaSummary.originalTotal)}
                </div>
                <span className="text-xs text-charcoal-500 mt-0.5 block">Baseline allocation</span>
              </div>

              <div className="p-5 rounded-2xl bg-violet-50/60 border border-violet-200">
                <span className="text-[11px] font-bold text-violet-800 uppercase tracking-wider block">
                  Proposed Plan B
                </span>
                <div className="text-2xl font-black text-violet-950 mt-1">
                  {formatINR(simulationResult.deltaSummary.proposedTotal)}
                </div>
                <span className="text-xs text-violet-700 mt-0.5 block font-semibold">
                  Target cap: {formatINR(simulationResult.maxAllowedBudget)}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-charcoal-50/70 border border-charcoal-200">
                <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block">
                  Net Budget Variance
                </span>
                <div className={`text-2xl font-black mt-1 flex items-center gap-1 ${
                  simulationResult.deltaSummary.difference <= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}>
                  {simulationResult.deltaSummary.difference <= 0 ? (
                    <TrendingDown className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <TrendingUp className="w-5 h-5 text-rose-600" />
                  )}
                  <span>{formatINR(simulationResult.deltaSummary.difference)}</span>
                </div>
                <span className="text-xs text-charcoal-500 mt-0.5 block">
                  {simulationResult.deltaSummary.percentageChange}% variance
                </span>
              </div>

              <div className={`p-5 rounded-2xl border ${
                simulationResult.isBudgetCompliant 
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}>
                <span className="text-[11px] font-bold uppercase tracking-wider block">
                  Cap Compliance Check
                </span>
                <div className="text-base font-black mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {simulationResult.proposedEvent.totalBudget <= simulationResult.maxAllowedBudget 
                      ? 'STRICTLY VERIFIED' 
                      : 'CAP EXCEEDED'}
                  </span>
                </div>
                <span className="text-xs text-charcoal-600 mt-0.5 block">
                  Total ≤ {formatINR(simulationResult.maxAllowedBudget)}
                </span>
              </div>
            </div>

            {/* Category Breakdown Comparison Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">
                Category Line-by-Line Allocation Shift
              </h3>

              <div className="overflow-x-auto rounded-2xl border border-charcoal-200">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-charcoal-50 border-b border-charcoal-200 text-charcoal-500 text-[11px] uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Department / Category</th>
                      <th className="py-3 px-4 text-right">Original Allocation</th>
                      <th className="py-3 px-4 text-right">Proposed Plan B</th>
                      <th className="py-3 px-4 text-right">Delta (Savings / Surge)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100">
                    {simulationResult.deltaSummary.categoryBreakdown.map((row) => (
                      <tr key={row.category} className="hover:bg-charcoal-50/40">
                        <td className="py-3 px-4 font-semibold text-charcoal-900">
                          {CATEGORY_LABELS[row.category]}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-charcoal-600">
                          {formatINR(row.original)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-charcoal-900">
                          {formatINR(row.proposed)}
                        </td>
                        <td className={`py-3 px-4 text-right font-bold ${
                          row.delta < 0 ? 'text-emerald-700' : row.delta > 0 ? 'text-rose-600' : 'text-charcoal-400'
                        }`}>
                          {row.delta < 0 ? formatINR(row.delta) : row.delta > 0 ? `+${formatINR(row.delta)}` : '₹0'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-violet-50/50 font-bold border-t-2 border-violet-200 text-charcoal-900">
                      <td className="py-3.5 px-4 text-violet-950 font-extrabold">TOTAL EVENT EXPENDITURE</td>
                      <td className="py-3.5 px-4 text-right text-charcoal-700">
                        {formatINR(simulationResult.deltaSummary.originalTotal)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-violet-950 text-base font-black">
                        {formatINR(simulationResult.deltaSummary.proposedTotal)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-800 text-base font-black">
                        {formatINR(simulationResult.deltaSummary.difference)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Strategic Proposed Changes & Tactical Rationales */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">
                Concrete Tactical Modifications & Strategic Rationale
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {simulationResult.changes.map((change, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-charcoal-200 bg-white shadow-subtle space-y-2 hover:border-violet-300 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant={change.budgetDelta < 0 ? 'emerald' : change.budgetDelta > 0 ? 'amber' : 'violet'}
                        size="sm"
                      >
                        {change.category}
                      </Badge>
                      <span className={`text-xs font-black ${
                        change.budgetDelta < 0 ? 'text-emerald-700' : change.budgetDelta > 0 ? 'text-rose-600' : 'text-charcoal-500'
                      }`}>
                        {change.budgetDelta < 0 ? formatINR(change.budgetDelta) : change.budgetDelta > 0 ? `+${formatINR(change.budgetDelta)}` : 'Cost-Neutral'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-charcoal-900">{change.itemTitle}</h4>
                    <p className="text-xs text-charcoal-600 leading-relaxed">{change.description}</p>

                    <div className="p-3 rounded-xl bg-violet-50/70 border border-violet-100 text-xs text-violet-950 leading-relaxed">
                      <strong>PlanB Rationale:</strong> {change.rationale}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Affected Operational Tasks */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">
                Impacted Milestones & Action Directives
              </h3>

              <div className="space-y-2.5">
                {simulationResult.affectedTasks.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex items-start gap-3 text-xs sm:text-sm"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-charcoal-900">{t.taskTitle}</span>
                      <p className="text-xs text-charcoal-600">{t.impact}</p>
                      <p className="text-xs font-bold text-amber-900">
                        Action: {t.actionRequired}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Advice Notes */}
            <div className="p-5 rounded-2xl bg-charcoal-50 border border-charcoal-200 space-y-2">
              <span className="text-xs font-bold text-charcoal-600 uppercase tracking-wider block">
                Executive Strategy Directives
              </span>
              <ul className="space-y-1.5 text-xs text-charcoal-700">
                {simulationResult.strategicAdvice.map((advice, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-violet-700 font-bold">•</span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Plan Version History & Rollback Section */}
      {activeEvent.revisions && activeEvent.revisions.length > 0 && (
        <div className="bg-white rounded-3xl border border-charcoal-200 shadow-subtle p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-charcoal-900">Plan Version History & Rollback</h3>
              <p className="text-xs text-charcoal-500">Every approved simulation snapshot is preserved for instant safe rollback</p>
            </div>
            <Badge variant="violet" size="sm">Immutable Snapshots</Badge>
          </div>

          <div className="space-y-3 pt-2">
            {activeEvent.revisions.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl border border-charcoal-200 bg-charcoal-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal-900">{rev.scenarioTitle}</span>
                    <Badge variant={rev.status === 'applied' ? 'emerald' : 'slate'} size="sm">
                      {rev.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-charcoal-500">
                    Applied on: {new Date(rev.createdAt).toLocaleString()} • Previous Budget: {formatINR(rev.previousBudget)} → New: {formatINR(rev.newBudget)}
                  </p>
                </div>

                {rev.status === 'applied' && (
                  <button
                    onClick={() => rollbackPlanRevision(rev.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-charcoal-700 bg-white hover:bg-charcoal-100 border border-charcoal-300 transition-colors shadow-subtle self-start sm:self-auto"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-charcoal-500" />
                    <span>Revert to this Snapshot</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Confirmation Modal */}
      <Modal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        title="Approve & Apply Plan B"
        subtitle="Explicit verification required before modifying active event plan."
        maxWidth="lg"
      >
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>You are about to activate "{simulationResult?.scenarioTitle}"</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              Applying this scenario will adjust your active budget cap to{' '}
              <strong>{formatINR(simulationResult?.proposedEvent.totalBudget || 0)}</strong>, update category line items, and mark affected tasks for committee review.
            </p>
          </div>

          <div className="space-y-2 text-xs text-charcoal-700 bg-charcoal-50 p-4 rounded-xl border border-charcoal-100">
            <span className="font-bold block text-charcoal-900">Safety Guarantee:</span>
            <p>
              Your current baseline plan (Version {activeEvent.currentPlanVersion}) will be stored in an immutable snapshot. You can roll back to it at any time with one click.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-charcoal-100">
            <button
              type="button"
              onClick={() => setIsApprovalModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-charcoal-600 hover:bg-charcoal-100"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isApplying}
              onClick={handleConfirmApply}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-violet-800 hover:bg-violet-900 shadow-card disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isApplying ? 'Applying Plan B...' : 'Yes, Apply Revised Plan'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
