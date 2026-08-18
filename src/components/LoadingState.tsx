import React from 'react';
import { Sparkles, Brain, Cpu, Zap } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Analyzing your scrolling patterns...",
  subMessage = "Evaluating underlying tech intent & filtering clickbait hype"
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 bg-[#0E0E17]/60 rounded-2xl border border-white/5">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 animate-pulse shadow-xl shadow-violet-500/20">
          <div className="w-full h-full bg-[#06060A] rounded-[14px] flex items-center justify-center">
            <Brain className="w-8 h-8 text-cyan-400 animate-bounce" />
          </div>
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 animate-ping" />
      </div>

      <div className="space-y-1">
        <h4 className="text-base font-semibold text-white">{message}</h4>
        <p className="text-xs text-slate-400 max-w-sm">{subMessage}</p>
      </div>

      <div className="flex items-center space-x-2 text-[11px] text-violet-400 bg-violet-950/40 px-3 py-1 rounded-full border border-violet-500/20">
        <Cpu className="w-3.5 h-3.5 animate-spin" />
        <span>Claude AI Recommendation Agent Processing</span>
      </div>
    </div>
  );
};
