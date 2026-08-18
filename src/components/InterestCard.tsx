import React from 'react';
import { Zap, TrendingUp, Info, CheckCircle, Award } from 'lucide-react';
import { InterestItem } from '../types';

interface InterestCardProps {
  item: InterestItem;
  rank: number;
}

export const InterestCard: React.FC<InterestCardProps> = ({ item, rank }) => {
  const percentage = Math.round(item.confidence * 100);

  const getBarColor = (pct: number) => {
    if (pct >= 85) return 'from-violet-500 to-indigo-500';
    if (pct >= 70) return 'from-cyan-500 to-blue-500';
    if (pct >= 50) return 'from-emerald-500 to-teal-500';
    return 'from-amber-500 to-orange-500';
  };

  return (
    <div className="bg-[#0E0E17] rounded-xl border border-white/10 p-4 hover:border-violet-500/30 transition-all duration-200 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="w-6 h-6 rounded-md bg-white/5 border border-white/10 text-xs font-bold text-slate-300 flex items-center justify-center">
            #{rank}
          </span>
          <h4 className="font-semibold text-white text-sm sm:text-base">{item.topic}</h4>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-base font-bold text-white tracking-tight">{percentage}%</span>
          <span className="text-[10px] text-slate-400 font-medium uppercase">Affinity</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getBarColor(percentage)} transition-all duration-700`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {item.evidence && (
        <p className="text-xs text-slate-400 bg-[#141424] p-2 rounded-lg border border-white/5 leading-relaxed">
          {item.evidence}
        </p>
      )}
    </div>
  );
};
