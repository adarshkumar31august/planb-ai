import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverEffect = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-charcoal-200/80 shadow-subtle p-6 transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-card hover:border-violet-300 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
