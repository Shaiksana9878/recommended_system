import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Sparkles, Filter, CheckCircle2, Clock, Zap } from 'lucide-react';
import { recommendationAPI } from '../services/api';
import { Recommendation } from '../types';
import { LoadingState } from '../components/LoadingState';

export const History: React.FC = () => {
  const [history, setHistory] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await recommendationAPI.getRecommendations();
      if (res.success && res.data) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const categories = ['All', 'System Design', 'AI', 'Career', 'Technology', 'Databases', 'Programming'];

  const filteredHistory = categoryFilter === 'All'
    ? history
    : history.filter(h => h.category.toLowerCase() === categoryFilter.toLowerCase());

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingState message="Loading recommendation audit history..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 selection:bg-violet-600 selection:text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
            <HistoryIcon className="w-4 h-4 text-cyan-400" />
            <span>Audit Trail</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Recommendation History ({history.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete database records of past AI inferences, detected underlying interests, and recommendations.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex items-center space-x-1 bg-[#141424] p-1 rounded-xl border border-white/10 overflow-x-auto">
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-12 text-center space-y-3">
          <HistoryIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No History Records Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Your recommendation history will appear here once you generate recommendations.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-[#0E0E17] rounded-2xl border border-white/10 p-5 shadow-xl hover:border-violet-500/30 transition-all space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-semibold text-[11px]">
                    {item.category}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[11px]">
                    {item.difficulty}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
                    Confidence: {item.confidence}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Trigger Reel / Context:</span>
                  <p className="font-semibold text-slate-200">{item.current_reel_title || 'General Scroll Feed'}</p>
                  <p className="text-slate-400 mt-1"><strong>Interest Inferred:</strong> {item.detected_interest}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{item.why_detected}</p>
                </div>

                <div className="space-y-1 bg-[#141424] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-cyan-400">Recommended Tech Content:</span>
                  <h4 className="text-sm font-bold text-white">{item.recommended_title}</h4>
                  <p className="text-slate-300 text-[11px] mt-1">{item.why_recommendation}</p>
                </div>
              </div>

              {item.feedback && (
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    User Feedback: {item.feedback.is_useful ? '👍 Marked Useful' : '👎 Not Useful'}
                    {item.feedback.feedback_reason ? ` (${item.feedback.feedback_reason})` : ''}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
