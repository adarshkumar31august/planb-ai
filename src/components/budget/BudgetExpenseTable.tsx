import React from 'react';
import { ExpenseItem } from '../../types';
import { Badge } from '../common/Badge';
import { formatINR, CATEGORY_LABELS, CATEGORY_COLORS } from '../../utils/budgetCalculations';
import { Edit3, Trash2 } from 'lucide-react';

interface BudgetExpenseTableProps {
  expenses: ExpenseItem[];
  onEdit: (expense: ExpenseItem) => void;
  onDelete: (expenseId: string, expenseName: string) => void;
}

export const BudgetExpenseTable: React.FC<BudgetExpenseTableProps> = ({
  expenses,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-charcoal-200">
      <table className="w-full text-left border-collapse text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-charcoal-200 text-charcoal-400 uppercase tracking-wider text-[11px] bg-charcoal-50/70 font-semibold">
            <th scope="col" className="py-3 px-4">Line Item</th>
            <th scope="col" className="py-3 px-3">Department</th>
            <th scope="col" className="py-3 px-3">Priority</th>
            <th scope="col" className="py-3 px-3 text-right">Allocated</th>
            <th scope="col" className="py-3 px-3 text-right">Actual</th>
            <th scope="col" className="py-3 px-3 text-right">Paid</th>
            <th scope="col" className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-charcoal-100">
          {expenses.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-10 text-center text-charcoal-400 text-xs">
                No expense items found matching the selected filters.
              </td>
            </tr>
          ) : (
            expenses.map((item) => (
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
                      aria-hidden="true"
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
                      type="button"
                      onClick={() => onEdit(item)}
                      aria-label={`Edit ${item.name}`}
                      title={`Edit ${item.name}`}
                      className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-900 hover:bg-charcoal-100 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id, item.name)}
                      aria-label={`Delete ${item.name}`}
                      title={`Delete ${item.name}`}
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
  );
};
