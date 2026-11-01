import type { ExpenseCategory, ExpenseItem, BudgetDeltaSummary } from '../types/index.ts';

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  venue: 'Venue & Space',
  catering: 'Catering & Food',
  decor: 'Decor & Ambience',
  entertainment_av: 'Sound, Lights & AV',
  photography: 'Photo & Video',
  logistics: 'Logistics & Rentals',
  contingency: 'Contingency & Buffer',
  other: 'Miscellaneous',
};

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  venue: '#4F46E5',         // Indigo
  catering: '#F59E0B',      // Amber
  decor: '#EC4899',         // Pink
  entertainment_av: '#8B5CF6', // Violet
  photography: '#06B6D4',   // Cyan
  logistics: '#10B981',     // Emerald
  contingency: '#6B7280',   // Gray
  other: '#9CA3AF',         // Slate
};

/**
 * Format currency strictly in Indian Rupee format (e.g. ₹25,000)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate total allocated expenses strictly via JavaScript arithmetic
 */
export function calculateTotalAllocated(expenses: ExpenseItem[]): number {
  return expenses.reduce((sum, item) => sum + (Number(item.allocatedAmount) || 0), 0);
}

/**
 * Calculate total actual expenses spent
 */
export function calculateTotalActual(expenses: ExpenseItem[]): number {
  return expenses.reduce((sum, item) => sum + (Number(item.actualAmount) || 0), 0);
}

/**
 * Calculate total paid amount
 */
export function calculateTotalPaid(expenses: ExpenseItem[]): number {
  return expenses.reduce((sum, item) => sum + (Number(item.paidAmount) || 0), 0);
}

/**
 * Compute aggregate per-category allocations
 */
export interface CategoryAggregate {
  category: ExpenseCategory;
  label: string;
  allocated: number;
  actual: number;
  percentageOfTotal: number;
  color: string;
  itemCount: number;
}

export function calculateCategoryBreakdown(
  expenses: ExpenseItem[],
  totalBudget: number
): CategoryAggregate[] {
  const map = new Map<ExpenseCategory, { allocated: number; actual: number; count: number }>();

  // Initialize all known categories with 0
  const categories: ExpenseCategory[] = [
    'venue',
    'catering',
    'decor',
    'entertainment_av',
    'photography',
    'logistics',
    'contingency',
    'other',
  ];

  categories.forEach((cat) => {
    map.set(cat, { allocated: 0, actual: 0, count: 0 });
  });

  expenses.forEach((item) => {
    const existing = map.get(item.category) || { allocated: 0, actual: 0, count: 0 };
    existing.allocated += Number(item.allocatedAmount) || 0;
    existing.actual += Number(item.actualAmount) || 0;
    existing.count += 1;
    map.set(item.category, existing);
  });

  const totalAllocated = calculateTotalAllocated(expenses);
  const baseForPercentage = totalBudget > 0 ? totalBudget : (totalAllocated > 0 ? totalAllocated : 1);

  return categories
    .map((cat) => {
      const data = map.get(cat) || { allocated: 0, actual: 0, count: 0 };
      const percentageOfTotal = Math.round((data.allocated / baseForPercentage) * 100);
      return {
        category: cat,
        label: CATEGORY_LABELS[cat] || cat,
        allocated: data.allocated,
        actual: data.actual,
        percentageOfTotal,
        color: CATEGORY_COLORS[cat] || '#6B7280',
        itemCount: data.count,
      };
    })
    .filter((cat) => cat.allocated > 0 || cat.itemCount > 0);
}

export interface BudgetHealth {
  status: 'healthy' | 'caution' | 'exceeded';
  percentUsed: number;
  remainingAmount: number;
  message: string;
}

export function getBudgetHealth(totalBudget: number, totalAllocated: number): BudgetHealth {
  if (totalBudget <= 0) {
    return {
      status: 'exceeded',
      percentUsed: 100,
      remainingAmount: 0,
      message: 'No budget set. Please specify a budget.',
    };
  }

  const percentUsed = Math.round((totalAllocated / totalBudget) * 100);
  const remainingAmount = totalBudget - totalAllocated;

  if (totalAllocated > totalBudget) {
    return {
      status: 'exceeded',
      percentUsed,
      remainingAmount,
      message: `Allocated expenses exceed your budget by ${formatINR(Math.abs(remainingAmount))} (${percentUsed}% allocated)!`,
    };
  }

  if (percentUsed >= 90) {
    return {
      status: 'caution',
      percentUsed,
      remainingAmount,
      message: `Approaching budget cap: ${percentUsed}% allocated (${formatINR(remainingAmount)} buffer remaining).`,
    };
  }

  return {
    status: 'healthy',
    percentUsed,
    remainingAmount,
    message: `Within safe limit: ${percentUsed}% allocated with ${formatINR(remainingAmount)} available buffer.`,
  };
}

/**
 * Compare original vs proposed expenses and verify non-exceedance
 */
export function calculateBudgetDelta(
  originalExpenses: ExpenseItem[],
  proposedExpenses: ExpenseItem[],
  targetBudgetCap?: number
): BudgetDeltaSummary {
  const originalTotal = calculateTotalAllocated(originalExpenses);
  const proposedTotal = calculateTotalAllocated(proposedExpenses);
  const difference = proposedTotal - originalTotal;
  const percentageChange = originalTotal > 0 ? Math.round((difference / originalTotal) * 100) : 0;

  const categories: ExpenseCategory[] = [
    'venue',
    'catering',
    'decor',
    'entertainment_av',
    'photography',
    'logistics',
    'contingency',
    'other',
  ];

  const origMap = new Map<ExpenseCategory, number>();
  const propMap = new Map<ExpenseCategory, number>();

  for (const e of originalExpenses) {
    origMap.set(e.category, (origMap.get(e.category) || 0) + (Number(e.allocatedAmount) || 0));
  }
  for (const e of proposedExpenses) {
    propMap.set(e.category, (propMap.get(e.category) || 0) + (Number(e.allocatedAmount) || 0));
  }

  const categoryBreakdown = categories
    .map((cat) => {
      const original = origMap.get(cat) || 0;
      const proposed = propMap.get(cat) || 0;
      return {
        category: cat,
        original,
        proposed,
        delta: proposed - original,
      };
    })
    .filter((c) => c.original > 0 || c.proposed > 0);

  const isWithinBudget = targetBudgetCap !== undefined ? proposedTotal <= targetBudgetCap : true;

  return {
    originalTotal,
    proposedTotal,
    difference,
    percentageChange,
    isWithinBudget,
    categoryBreakdown,
  };
}
