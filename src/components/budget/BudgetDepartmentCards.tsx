import React from 'react';
import { ExpenseItem } from '../../types';
import { formatINR, CategoryAggregate } from '../../utils/budgetCalculations';
import { Edit3 } from 'lucide-react';

interface BudgetDepartmentCardsProps {
  categoryAggregates: CategoryAggregate[];
  expenses: ExpenseItem[];
  onEdit: (expense: ExpenseItem) => void;
}

export const BudgetDepartmentCards: React.FC<BudgetDepartmentCardsProps> = ({
  categoryAggregates,
  expenses,
  onEdit,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {categoryAggregates.map((cat) => {
        const items = expenses.filter(e => e.category === cat.category);
        return (
          <div 
            key={cat.category} 
            className="p-5 rounded-2xl border border-charcoal-200 bg-white shadow-subtle space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full shrink-0" 
                  style={{ backgroundColor: cat.color }} 
                  aria-hidden="true"
                />
                <h3 className="font-bold text-charcoal-900">{cat.label}</h3>
              </div>
              <span className="font-black text-charcoal-900">{formatINR(cat.allocated)}</span>
            </div>

            <div className="space-y-1.5 divide-y divide-charcoal-100 text-xs">
              {items.length === 0 ? (
                <p className="text-charcoal-400 py-2 text-center text-xs">No items in this department</p>
              ) : (
                items.map(item => (
                  <div key={item.id} className="pt-1.5 flex items-center justify-between">
                    <span className="text-charcoal-700 truncate max-w-[200px]" title={item.name}>
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-charcoal-900">
                        {formatINR(item.allocatedAmount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        aria-label={`Edit ${item.name}`}
                        className="p-1 text-charcoal-400 hover:text-charcoal-800 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
