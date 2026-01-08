
import React from 'react';

interface Props {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  colorClass?: string;
}

export const StatCard: React.FC<Props> = ({ label, value, subValue, icon, colorClass = "text-blue-600" }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
    <div className="flex items-center justify-between mb-2">
      <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</span>
      {icon}
    </div>
    <div>
      <h3 className={`text-2xl font-bold ${colorClass}`}>{value}</h3>
      {subValue && <p className="text-slate-400 text-xs mt-1">{subValue}</p>}
    </div>
  </div>
);
