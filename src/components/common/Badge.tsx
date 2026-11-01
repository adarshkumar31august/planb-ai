import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'violet' | 'amber' | 'emerald' | 'rose' | 'slate' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  const variantClasses = {
    default: 'bg-charcoal-100 text-charcoal-800 border border-charcoal-200',
    violet: 'bg-violet-50 text-violet-800 border border-violet-200',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    rose: 'bg-rose-50 text-rose-800 border border-rose-200',
    slate: 'bg-stone-100 text-stone-700 border border-stone-200',
    outline: 'bg-transparent text-charcoal-700 border border-charcoal-300',
  }[variant];

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};
