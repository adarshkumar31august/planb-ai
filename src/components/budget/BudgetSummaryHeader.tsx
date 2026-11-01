import React from 'react';
import { Card } from '../common/Card';
import { formatINR, BudgetHealth, CategoryAggregate } from '../../utils/budgetCalculations';
import { AlertTriangle, Sparkles } from 'lucide-react';

interface BudgetSummaryHeaderProps {
  totalBudget: number;
  totalAllocated: number;
  totalPaid: number;
  budgetHealth: BudgetHealth;
  categoryAggregates: CategoryAggregate[];
  selectedCategoryFilter: string;
  onSelectCategoryFilter: (category: string) => void;
  onNavigateToSimulator: () => void;
}

export const BudgetSummaryHeader: React.FC<BudgetSummaryHeaderProps> = ({
  totalBudget,
  totalAllocated,
  totalPaid,
  budgetHealth,
  categoryAggregates,
  selectedCategoryFilter,
  onSelectCategoryFilter,
  onNavigateToSimulator,
}) => {
  return (
    <div className="space-y-6">
      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 hover:border-violet-300 transition-all">
          <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block">
            Approved Budget Cap
          </span>
          <div className="text-2xl sm:text-3xl font-black text-charcoal-900 mt-1">
            {formatINR(totalBudget)}
          </div>
          <span className="text-xs text-charcoal-500 mt-0.5 block">
            Baseline authorization
          </span>
        </Card>

        <Card className="p-5 hover:border-violet-300 transition-all">
          <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block">
            Total Allocated
          </span>
          <div className={`text-2xl sm:text-3xl font-black mt-1 ${
            totalAllocated > totalBudget ? 'text-rose-600' : 'text-charcoal-900'
          }`}>
            {formatINR(totalAllocated)}
          </div>
          <span className="text-xs text-charcoal-500 mt-0.5 block">
            {budgetHealth.percentUsed}% of total cap
          </span>
        </Card>

        <Card className="p-5 hover:border-violet-300 transition-all">
          <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block">
            Actual Paid Out
          </span>
          <div className="text-2xl sm:text-3xl font-black text-charcoal-900 mt-1">
            {formatINR(totalPaid)}
          </div>
          <span className="text-xs text-charcoal-500 mt-0.5 block">
            Committed vendor advances
          </span>
        </Card>

        <Card className="p-5 hover:border-violet-300 transition-all">
          <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block">
            Buffer Remaining
          </span>
          <div className={`text-2xl sm:text-3xl font-black mt-1 ${
            budgetHealth.remainingAmount < 0 ? 'text-rose-600' : 'text-emerald-700'
          }`}>
            {formatINR(budgetHealth.remainingAmount)}
          </div>
          <span className="text-xs text-charcoal-500 mt-0.5 block font-medium">
            {budgetHealth.remainingAmount < 0 ? 'Over budget limit!' : 'Unallocated safety buffer'}
          </span>
        </Card>
      </div>

      {/* Overspend Warning Banner */}
      {budgetHealth.status === 'exceeded' && (
        <div 
          role="alert"
          aria-live="assertive"
          className="p-5 rounded-3xl bg-rose-50 border border-rose-300 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle animate-pulse"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold">Budget Limit Exceeded!</h4>
              <p className="text-xs text-rose-800 leading-relaxed">
                {budgetHealth.message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateToSimulator}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 shrink-0 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Balance in What-If Simulator</span>
          </button>
        </div>
      )}

      {/* Visual Multi-Segment Bar */}
      <div className="space-y-2">
        <div 
          className="w-full h-4 rounded-full bg-charcoal-100 overflow-hidden flex shadow-inner"
          role="progressbar"
          aria-valuenow={Math.min(100, budgetHealth.percentUsed)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Budget allocation distribution"
        >
          {categoryAggregates.map((cat) => (
            <div
              key={cat.category}
              style={{
                width: `${cat.percentageOfTotal}%`,
                backgroundColor: cat.color,
              }}
              className="h-full transition-all hover:opacity-85 cursor-pointer"
              title={`${cat.label}: ${formatINR(cat.allocated)} (${cat.percentageOfTotal}%)`}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-charcoal-600 pt-2">
          {categoryAggregates.map((cat) => (
            <button
              key={cat.category}
              type="button"
              onClick={() => onSelectCategoryFilter(selectedCategoryFilter === cat.category ? 'all' : cat.category)}
              aria-pressed={selectedCategoryFilter === cat.category}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                selectedCategoryFilter === cat.category
                  ? 'border-charcoal-900 bg-charcoal-900 text-white font-bold'
                  : 'border-transparent hover:bg-charcoal-50 text-charcoal-700'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              <span>{cat.label}:</span>
              <span className="font-bold">{formatINR(cat.allocated)}</span>
              <span className="opacity-70">({cat.percentageOfTotal}%)</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
