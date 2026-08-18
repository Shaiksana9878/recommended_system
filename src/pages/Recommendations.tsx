import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  RefreshCw,
  Zap,
  Filter,
  History,
  Compass,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { recommendationAPI, reelAPI } from '../services/api';
import { Recommendation, Reel } from '../types';
import { RecommendationCard } from '../components/RecommendationCard';
import { LoadingState } from '../components/LoadingState';

export const Recommendations: React.FC = () => {
  const [searchParams] = useSearchParams();
  const reelIdParam = searchParams.get('reelId');

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activeReel, setActiveReel] = useState<Reel | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await recommendationAPI.getRecommendations();
      if (res.success && res.data) {
        setRecommendations(res.data);
      }

      if (reelIdParam) {
        const rRes = await reelAPI.getReelById(parseInt(reelIdParam, 10));
        if (rRes.success && rRes.data) {
          setActiveReel(rRes.data);
        }
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [reelIdParam]);

  const handleGenerate = async (targetReelId?: number | null) => {
    setGenerating(true);
    try {
      const res = await recommendationAPI.generate(targetReelId);
      if (res.success && res.data) {
        setRecommendations((prev) => [res.data, ...prev]);
        setToastMessage('New recommendation generated & saved to history.');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to generate recommendation:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleFeedback = async (
    recommendationId: string,
    isUseful: boolean | null,
    reason?: string,
    comments?: string
  ) => {
    await recommendationAPI.recordFeedback(recommendationId, {
      is_useful: isUseful,
      feedback_reason: reason,
      comments,
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingState message="Synthesizing personalized recommendations..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 selection:bg-violet-600 selection:text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Content Curator</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Personalized Technology Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Synthesized by Claude based on your underlying interests, engagement signals, and verified technical learning value.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            to="/history"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#141424] text-slate-300 hover:text-white border border-white/10 hover:border-violet-500/30 flex items-center space-x-2 transition-all"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span>View History</span>
          </Link>

          <button
            onClick={() => handleGenerate(activeReel?.id || null)}
            disabled={generating}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/25 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Synthesizing...' : 'Generate New Recommendation'}</span>
          </button>
        </div>
      </div>

      {/* Active Reel Context Banner if navigated from a specific reel */}
      {activeReel && (
        <div className="bg-[#141424] border border-violet-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
              Active Reel Context
            </span>
            <h4 className="text-sm font-bold text-white">{activeReel.title}</h4>
            <p className="text-xs text-slate-400">{activeReel.category} • @{activeReel.creator}</p>
          </div>
          <button
            onClick={() => handleGenerate(activeReel.id)}
            disabled={generating}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/20 shrink-0"
          >
            Bridge This Reel to Deep Tech
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 bg-violet-600 text-white text-xs font-medium rounded-xl flex items-center justify-between shadow-lg shadow-violet-600/30 animate-fadeIn">
          <span>{toastMessage}</span>
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )}

      {/* Recommendations Feed */}
      {recommendations.length === 0 ? (
        <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-12 text-center space-y-4">
          <Sparkles className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Recommendations Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Interact with a few reels or click below to generate your first AI technology bridge recommendation.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => handleGenerate(null)}
              disabled={generating}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-500"
            >
              {generating ? 'Synthesizing...' : 'Generate Now'}
            </button>
            <Link
              to="/explore"
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#141424] text-slate-200 border border-white/10 hover:text-white"
            >
              Explore Sample Reels
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onFeedback={handleFeedback}
            />
          ))}
        </div>
      )}
    </div>
  );
};
