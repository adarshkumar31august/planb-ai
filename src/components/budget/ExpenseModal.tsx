import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { ExpenseItem, ExpenseCategory, ExpensePriority } from '../../types';
import { CATEGORY_LABELS } from '../../utils/budgetCalculations';
import { sanitizeTextInput } from '../../utils/validators';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingExpense: ExpenseItem | null;
  onSave: (expenseData: {
    name: string;
    category: ExpenseCategory;
    allocatedAmount: number;
    actualAmount: number;
    paidAmount: number;
    priority: ExpensePriority;
    notes: string;
  }) => Promise<void>;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  editingExpense,
  onSave,
}) => {
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('catering');
  const [formAllocated, setFormAllocated] = useState('');
  const [formActual, setFormActual] = useState('');
  const [formPaid, setFormPaid] = useState('');
  const [formPriority, setFormPriority] = useState<ExpensePriority>('essential');
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setFormName(editingExpense.name);
      setFormCategory(editingExpense.category);
      setFormAllocated(editingExpense.allocatedAmount.toString());
      setFormActual(editingExpense.actualAmount.toString());
      setFormPaid(editingExpense.paidAmount.toString());
      setFormPriority(editingExpense.priority);
      setFormNotes(editingExpense.notes || '');
    } else {
      setFormName('');
      setFormCategory('catering');
      setFormAllocated('');
      setFormActual('');
      setFormPaid('');
      setFormPriority('essential');
      setFormNotes('');
    }
  }, [editingExpense, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAllocated) return;

    try {
      setIsSubmitting(true);
      await onSave({
        name: sanitizeTextInput(formName),
        category: formCategory,
        allocatedAmount: Number(formAllocated) || 0,
        actualAmount: Number(formActual) || 0,
        paidAmount: Number(formPaid) || 0,
        priority: formPriority,
        notes: sanitizeTextInput(formNotes),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingExpense ? 'Edit Expense Item' : 'Add New Expense Item'}
      subtitle="Manage line-item allocation and category priority."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="exp-title" className="text-xs font-semibold text-charcoal-800">
            Expense Title *
          </label>
          <input
            id="exp-title"
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
            <label htmlFor="exp-category" className="text-xs font-semibold text-charcoal-800">
              Department *
            </label>
            <select
              id="exp-category"
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
            <label htmlFor="exp-priority" className="text-xs font-semibold text-charcoal-800">
              Priority Level
            </label>
            <select
              id="exp-priority"
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
            <label htmlFor="exp-allocated" className="text-xs font-semibold text-charcoal-800">
              Allocated (₹) *
            </label>
            <input
              id="exp-allocated"
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
            <label htmlFor="exp-actual" className="text-xs font-semibold text-charcoal-800">
              Actual Spent (₹)
            </label>
            <input
              id="exp-actual"
              type="number"
              min="0"
              value={formActual}
              onChange={(e) => setFormActual(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:border-violet-600"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="exp-paid" className="text-xs font-semibold text-charcoal-800">
              Paid Advance (₹)
            </label>
            <input
              id="exp-paid"
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
          <label htmlFor="exp-notes" className="text-xs font-semibold text-charcoal-800">
            Notes & Contract Terms
          </label>
          <textarea
            id="exp-notes"
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
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-charcoal-600 hover:bg-charcoal-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-violet-800 hover:bg-violet-900 shadow-card transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : editingExpense ? 'Save Changes' : 'Add Line Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
