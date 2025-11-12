import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  value: number;
  label: string;
  accentClass: string;
  iconWrapperClass: string;
}

export const StatCard = ({
  icon,
  value,
  label,
  accentClass,
  iconWrapperClass,
}: StatCardProps) => {
  return (
    <div className="group rounded-2xl px-5 py-4 border border-white/60 bg-white/80 backdrop-blur-sm shadow-[0_18px_35px_rgba(15,23,42,0.08)] flex items-center justify-between gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(15,23,42,0.12)]">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg transition-transform duration-300 group-hover:scale-105 ${iconWrapperClass}`}>
          {icon}
        </div>
        <p className="text-sm font-semibold text-slate-500 tracking-tight">
          {label}
        </p>
      </div>
      <div className={`text-3xl font-semibold tracking-tight ${accentClass}`}>
        {value}
      </div>
    </div>
  );
};
