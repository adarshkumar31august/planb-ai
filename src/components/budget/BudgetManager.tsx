import React, { useState } from 'react';
import { useEvent } from '../../context/EventContext';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle,
  Download,
  Sparkles
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';
import { 
  formatINR, 
  calculateTotalAllocated, 
  calculateTotalPaid,
  calculateCategoryBreakdown,
  getBudgetHealth,
  CATEGORY_LABELS,
  CATEGORY_COLORS
} from '../../utils/budgetCalculations';
import { ExpenseCategory, ExpensePriority, ExpenseItem } from '../../types';

export const BudgetManager: React.FC = () => {
  const { activeEvent, addExpense, updateExpense, deleteExpense, setCurrentTab } = useEvent();

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grouped'>('table');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('catering');
  const [formAllocated, setFormAllocated] = useState('');
  const [formActual, setFormActual] = useState('');
  const [formPaid, setFormPaid] = useState('');
  const [formPriority, setFormPriority] = useState<ExpensePriority>('essential');
  const [formNotes, setFormNotes] = useState('');

  if (!activeEvent) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-charcoal-200">
        <p className="text-charcoal-600">Select an event to view smart budget</p>
      </div>
    );
  }

  const totalAllocated = calculateTotalAllocated(activeEvent.expenses);
  const totalPaid = calculateTotalPaid(activeEvent.expenses);
  const budgetHealth = getBudgetHealth(activeEvent.totalBudget, totalAllocated);
  const categoryAggregates = calculateCategoryBreakdown(activeEvent.expenses, activeEvent.totalBudget);

  const filteredExpenses = activeEvent.expenses.filter((e) => {
    const matchesCategory = selectedCategoryFilter === 'all' || e.category === selectedCategoryFilter;
    const matchesPriority = priorityFilter === 'all' || e.priority === priorityFilter;
    return matchesCategory && matchesPriority;
  });

  const handleOpenAdd = () => {
    setFormName('');
    setFormCategory('catering');
    setFormAllocated('');
    setFormActual('');
    setFormPaid('');
    setFormPriority('essential');
    setFormNotes('');
    setEditingExpense(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (exp: ExpenseItem) => {
    setEditingExpense(exp);
    setFormName(exp.name);
    setFormCategory(exp.category);
    setFormAllocated(exp.allocatedAmount.toString());
    setFormActual(exp.actualAmount.toString());
    setFormPaid(exp.paidAmount.toString());
    setFormPriority(exp.priority);
    setFormNotes(exp.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAllocated) return;

    const allocatedAmount = Number(formAllocated) || 0;
    const actualAmount = Number(formActual) || 0;
    const paidAmount = Number(formPaid) || 0;

    if (editingExpense) {
      await updateExpense(editingExpense.id, {
        name: formName.trim(),
        category: formCategory,
        allocatedAmount,
        actualAmount,
        paidAmount,
        priority: formPriority,
        notes: formNotes.trim(),
      });
    } else {
      await addExpense({
        name: formName.trim(),
        category: formCategory,
        allocatedAmount,
        actualAmount,
        paidAmount,
        priority: formPriority,
        notes: formNotes.trim(),
        isModifiedByPlanB: false,
      });
    }

    setIsAddModalOpen(false);
  };

  // Export CSV feature for professional planners
  const handleExportCSV = () => {
    const headers = ['Line Item', 'Category', 'Priority', 'Allocated (INR)', 'Actual (INR)', 'Paid (INR)', 'Notes'];
    const rows = activeEvent.expenses.map(e => [
      `"${e.name.replace(/"/g, '""')}"`,
      `"${CATEGORY_LABELS[e.category]}"`,
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
  };

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
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-charcoal-700 bg-white hover:bg-charcoal-50 border border-charcoal-200 transition-colors shadow-subtle"
            title="Download CSV for Excel/Sheets"
          >
            <Download className="w-4 h-4 text-charcoal-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-violet-800 hover:bg-violet-900 shadow-card transition-all hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 hover:border-violet-300 transition-all">
          <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-wider block">
            Approved Budget Cap
          </span>
          <div className="text-2xl sm:text-3xl font-black text-charcoal-900 mt-1">
            {formatINR(activeEvent.totalBudget)}
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
            totalAllocated > activeEvent.totalBudget ? 'text-rose-600' : 'text-charcoal-900'
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
        <div className="p-5 rounded-3xl bg-rose-50 border border-rose-300 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle animate-pulse">
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
            onClick={() => setCurrentTab('simulator')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 shrink-0 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Balance in What-If Simulator</span>
          </button>
        </div>
      )}

      {/* Visual Category Distribution & Progress Bars */}
      <div className="bg-white rounded-3xl border border-charcoal-200 shadow-subtle p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-charcoal-900">Category Distribution Breakdown</h2>
            <p className="text-xs text-charcoal-500">Visual expenditure share of each celebration department</p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-charcoal-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-charcoal-900 shadow-subtle' : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Line Items
            </button>
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'grouped' ? 'bg-white text-charcoal-900 shadow-subtle' : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Department Cards
            </button>
          </div>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="space-y-2">
          <div className="w-full h-4 rounded-full bg-charcoal-100 overflow-hidden flex shadow-inner">
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

          <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-600 pt-2">
            {categoryAggregates.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setSelectedCategoryFilter(selectedCategoryFilter === cat.category ? 'all' : cat.category)}
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

        {/* Filters and Priority Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-charcoal-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-charcoal-400 uppercase tracking-wider">Priority:</span>
            {['all', 'essential', 'flexible', 'discretionary'].map((p) => (
              <button
                key={p}
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
              onClick={() => setSelectedCategoryFilter('all')}
              className="text-xs text-violet-700 font-bold hover:underline"
            >
              Reset Category Filter
            </button>
          )}
        </div>

        {/* View Mode 1: Table View */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto rounded-2xl border border-charcoal-200">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-charcoal-200 text-charcoal-400 uppercase tracking-wider text-[11px] bg-charcoal-50/70 font-semibold">
                  <th className="py-3 px-4">Line Item</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3 text-right">Allocated</th>
                  <th className="py-3 px-3 text-right">Actual</th>
                  <th className="py-3 px-3 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-charcoal-400 text-xs">
                      No expense items found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((item) => (
                    <tr key={item.id} className="hover:bg-charcoal-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-charcoal-900">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{item.name}</span>
                          {item.isModifiedByPlanB && (
                            <Badge variant="violet" size="sm" className="text-[10px]">
                              Plan B
                            </Badge>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-xs text-charcoal-500 font-normal line-clamp-1 mt-0.5">
                            {item.notes}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-700">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
                          />
                          {CATEGORY_LABELS[item.category]}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <Badge
                          variant={
                            item.priority === 'essential'
                              ? 'slate'
                              : item.priority === 'flexible'
                              ? 'amber'
                              : 'violet'
                          }
                          size="sm"
                        >
                          {item.priority}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-3 font-bold text-charcoal-900 text-right">
                        {formatINR(item.allocatedAmount)}
                      </td>

                      <td className="py-3.5 px-3 text-charcoal-700 text-right font-medium">
                        {formatINR(item.actualAmount)}
                      </td>

                      <td className="py-3.5 px-3 text-charcoal-700 text-right font-medium">
                        {formatINR(item.paidAmount)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Expense"
                            className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-900 hover:bg-charcoal-100 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteExpense(item.id)}
                            title="Delete Line Item"
                            className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* View Mode 2: Department Grouped Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryAggregates.map((cat) => {
              const items = activeEvent.expenses.filter(e => e.category === cat.category);
              return (
                <div key={cat.category} className="p-5 rounded-2xl border border-charcoal-200 bg-white shadow-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <h3 className="font-bold text-charcoal-900">{cat.label}</h3>
                    </div>
                    <span className="font-black text-charcoal-900">{formatINR(cat.allocated)}</span>
                  </div>

                  <div className="space-y-1.5 divide-y divide-charcoal-100 text-xs">
                    {items.map(item => (
                      <div key={item.id} className="pt-1.5 flex items-center justify-between">
                        <span className="text-charcoal-700 truncate max-w-[200px]">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-charcoal-900">{formatINR(item.allocatedAmount)}</span>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="text-charcoal-400 hover:text-charcoal-800"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingExpense ? 'Edit Expense Item' : 'Add New Expense Item'}
        subtitle="Manage line-item allocation and category priority."
      >
        <form onSubmit={handleSaveExpense} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-charcoal-800">Expense Title *</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Quadrangle Lawn Setup & Sound"
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-800">Department *</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:border-violet-600 bg-white"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-800">Priority Level</label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as ExpensePriority)}
                className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:border-violet-600 bg-white"
              >
                <option value="essential">Essential (Non-negotiable)</option>
                <option value="flexible">Flexible (Can be modified)</option>
                <option value="discretionary">Discretionary (Frills)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-800">Allocated (₹) *</label>
              <input
                type="number"
                required
                min="0"
                value={formAllocated}
                onChange={(e) => setFormAllocated(e.target.value)}
                placeholder="6000"
                className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm font-semibold focus:outline-none focus:border-violet-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-800">Actual Spent (₹)</label>
              <input
                type="number"
                min="0"
                value={formActual}
                onChange={(e) => setFormActual(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:border-violet-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-800">Paid Advance (₹)</label>
              <input
                type="number"
                min="0"
                value={formPaid}
                onChange={(e) => setFormPaid(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:border-violet-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-charcoal-800">Notes & Contract Terms</label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g. Token advance paid to coordinator on campus..."
              className="w-full px-3 py-2 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:border-violet-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-charcoal-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-charcoal-600 hover:bg-charcoal-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-violet-800 hover:bg-violet-900 shadow-card"
            >
              {editingExpense ? 'Save Changes' : 'Add Line Item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
