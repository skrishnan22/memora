import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  value: number;
  label: string;
  iconColor: string;
}

export const StatCard = ({ icon, value, label, iconColor }: StatCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-2 min-w-[140px]">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-600 mt-0.5">{label}</div>
      </div>
    </div>
  );
};