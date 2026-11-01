import React, { useState, useMemo, useCallback } from 'react';
import { useEvent } from '../../context/EventContext';
import { Plus, Download } from 'lucide-react';
import { Badge } from '../common/Badge';
import { 
  calculateTotalAllocated, 
  calculateTotalPaid,
  calculateCategoryBreakdown,
  getBudgetHealth,
  CATEGORY_LABELS
} from '../../utils/budgetCalculations';
import { ExpenseItem, ExpenseCategory, ExpensePriority } from '../../types';
import { BudgetSummaryHeader } from './BudgetSummaryHeader';
import { BudgetExpenseTable } from './BudgetExpenseTable';
import { BudgetDepartmentCards } from './BudgetDepartmentCards';
import { ExpenseModal } from './ExpenseModal';

export const BudgetManager: React.FC = () => {
  const { activeEvent, addExpense, updateExpense, deleteExpense, setCurrentTab, showToast } = useEvent();

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grouped'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);

  const totalAllocated = useMemo(() => {
    return activeEvent ? calculateTotalAllocated(activeEvent.expenses) : 0;
  }, [activeEvent]);

  const totalPaid = useMemo(() => {
    return activeEvent ? calculateTotalPaid(activeEvent.expenses) : 0;
  }, [activeEvent]);

  const budgetHealth = useMemo(() => {
    return activeEvent ? getBudgetHealth(activeEvent.totalBudget, totalAllocated) : {
      status: 'healthy' as const,
      percentUsed: 0,
      remainingAmount: 0,
      message: ''
    };
  }, [activeEvent, totalAllocated]);

  const categoryAggregates = useMemo(() => {
    return activeEvent ? calculateCategoryBreakdown(activeEvent.expenses, activeEvent.totalBudget) : [];
  }, [activeEvent]);

  const filteredExpenses = useMemo(() => {
    if (!activeEvent) return [];
    return activeEvent.expenses.filter((e) => {
      const matchesCategory = selectedCategoryFilter === 'all' || e.category === selectedCategoryFilter;
      const matchesPriority = priorityFilter === 'all' || e.priority === priorityFilter;
      return matchesCategory && matchesPriority;
    });
  }, [activeEvent, selectedCategoryFilter, priorityFilter]);

  const handleOpenAdd = useCallback(() => {
    setEditingExpense(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((exp: ExpenseItem) => {
    setEditingExpense(exp);
    setIsModalOpen(true);
  }, []);

  const handleDeleteExpense = useCallback(async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the expense "${name}"?`)) {
      await deleteExpense(id);
      showToast('info', 'Expense Removed', `"${name}" was deleted from budget.`);
    }
  }, [deleteExpense, showToast]);

  const handleSaveExpense = useCallback(async (data: {
    name: string;
    category: ExpenseCategory;
    allocatedAmount: number;
    actualAmount: number;
    paidAmount: number;
    priority: ExpensePriority;
    notes: string;
  }) => {
    if (editingExpense) {
      await updateExpense(editingExpense.id, data);
      showToast('success', 'Expense Updated', `"${data.name}" line item has been updated.`);
    } else {
      await addExpense({
        ...data,
        isModifiedByPlanB: false,
      });
      showToast('success', 'Expense Added', `"${data.name}" added to budget.`);
    }
  }, [editingExpense, updateExpense, addExpense, showToast]);

  const handleExportCSV = useCallback(() => {
    if (!activeEvent) return;
    const headers = ['Line Item', 'Category', 'Priority', 'Allocated (INR)', 'Actual (INR)', 'Paid (INR)', 'Notes'];
    const rows = activeEvent.expenses.map(e => [
      `"${e.name.replace(/"/g, '""')}"`,
      `"${CATEGORY_LABELS[e.category] || e.category}"`,
      e.priority,
      e.allocatedAmount,
      e.actualAmount,
      e.paidAmount,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PlanB-Budget-${activeEvent.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [activeEvent]);

  if (!activeEvent) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-charcoal-200">
        <p className="text-charcoal-600">Select an event to view smart budget</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-charcoal-200 shadow-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-charcoal-900 tracking-tight">Smart Budget Engine</h1>
            <Badge variant="violet" size="sm" className="font-semibold">Calculated Arithmetic</Badge>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500">
            Deterministic category allocations with automated cap enforcement and overspend warnings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-charcoal-700 bg-white hover:bg-charcoal-50 border border-charcoal-200 transition-colors shadow-subtle"
            aria-label="Export budget to CSV"
            title="Download CSV for Excel/Sheets"
          >
            <Download className="w-4 h-4 text-charcoal-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-violet-800 hover:bg-violet-900 shadow-card transition-all hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Summary Header Metrics & Visual Allocation Bar */}
      <BudgetSummaryHeader
        totalBudget={activeEvent.totalBudget}
        totalAllocated={totalAllocated}
        totalPaid={totalPaid}
        budgetHealth={budgetHealth}
        categoryAggregates={categoryAggregates}
        selectedCategoryFilter={selectedCategoryFilter}
        onSelectCategoryFilter={setSelectedCategoryFilter}
        onNavigateToSimulator={() => setCurrentTab('simulator')}
      />

      {/* Main Budget Breakdown Card */}
      <div className="bg-white rounded-3xl border border-charcoal-200 shadow-subtle p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-charcoal-900">Category Distribution Breakdown</h2>
            <p className="text-xs text-charcoal-500">Expenditure share across all departments</p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-charcoal-100 p-1 rounded-xl text-xs font-semibold" role="tablist" aria-label="Budget views">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'table'}
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-charcoal-900 shadow-subtle' : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Line Items
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'grouped'}
              onClick={() => setViewMode('grouped')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'grouped' ? 'bg-white text-charcoal-900 shadow-subtle' : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Department Cards
            </button>
          </div>
        </div>

        {/* Filters and Priority Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-charcoal-100">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter expenses by priority">
            <span className="text-xs font-bold text-charcoal-400 uppercase tracking-wider">Priority:</span>
            {['all', 'essential', 'flexible', 'discretionary'].map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={priorityFilter === p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                  priorityFilter === p
                    ? 'bg-violet-800 text-white shadow-subtle'
                    : 'bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100 border border-charcoal-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {selectedCategoryFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('all')}
              className="text-xs text-violet-700 font-bold hover:underline"
            >
              Reset Category Filter
            </button>
          )}
        </div>

        {/* View Mode Switch */}
        {viewMode === 'table' ? (
          <BudgetExpenseTable
            expenses={filteredExpenses}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteExpense}
          />
        ) : (
          <BudgetDepartmentCards
            categoryAggregates={categoryAggregates}
            expenses={activeEvent.expenses}
            onEdit={handleOpenEdit}
          />
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingExpense={editingExpense}
        onSave={handleSaveExpense}
      />
    </div>
  );
};
