import React from 'react';
import { ShieldCheck } from 'lucide-react';

const Badge = ({ children, variant = 'info', className = '', showVerifiedIcon = false }) => {
  const variantStyles = {
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    navy: 'bg-slate-100 text-slate-800 border-slate-300',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        variantStyles[variant] || variantStyles.info
      } ${className}`}
    >
      {showVerifiedIcon && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />}
      {children}
    </span>
  );
};

export default Badge;
