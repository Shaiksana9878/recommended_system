import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  TrendingUp,
  Compass,
  Bookmark,
  History,
  Info,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Play,
  Heart,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { interestAPI, recommendationAPI, reelAPI } from '../services/api';
import { InterestProfile, Recommendation, Reel } from '../types';
import { RecommendationCard } from '../components/RecommendationCard';
import { ReelPlayerModal } from '../components/ReelPlayerModal';
import { LoadingState } from '../components/LoadingState';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [interestProfile, setInterestProfile] = useState<InterestProfile | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recentReels, setRecentReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [whyModalOpen, setWhyModalOpen] = useState(false);
  const [activePlayerReelId, setActivePlayerReelId] = useState<number>(1);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [intRes, recRes, reelRes] = await Promise.all([
        interestAPI.getProfile().catch(() => ({ data: null })),
        recommendationAPI.getRecommendations().catch(() => ({ data: [] })),
        reelAPI.getAllReels().catch(() => ({ data: [] })),
      ]);

      if (intRes?.data) setInterestProfile(intRes.data);
      if (recRes?.data) setRecommendations(recRes.data);
      if (reelRes?.data) setRecentReels(reelRes.data.slice(0, 4));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleGenerateTodayPick = async () => {
    setGenerating(true);
    try {
      const res = await recommendationAPI.generate(null);
      if (res.success && res.data) {
        setRecommendations((prev) => [res.data, ...prev]);
        const intRes = await interestAPI.getProfile();
        if (intRes.data) setInterestProfile(intRes.data);
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
        <LoadingState message="Loading your personalized dashboard..." />
      </div>
    );
  }

  const primaryInterests = interestProfile?.primary_interests || [
    { topic: 'Software Engineering', confidence: 0.92, evidence: 'Interacted with programming lifestyle and developer workflows.' },
    { topic: 'Programming', confidence: 0.87, evidence: 'Watched Java and syntax problem-solving clips.' },
    { topic: 'Artificial Intelligence', confidence: 0.71, evidence: 'Engaged with LLM architectures and neural network fundamentals.' },
    { topic: 'Developer Hardware', confidence: 0.65, evidence: 'Viewed developer workstation benchmarks and comparisons.' },
  ];

  const topRecommendation = recommendations[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 selection:bg-violet-600 selection:text-white">
      {/* Dynamic Welcome Hero */}
      <div className="bg-[#0E0E17] rounded-3xl border border-white/10 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-violet-600/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#141424] border border-violet-500/30 text-xs font-semibold text-violet-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Personalized AI Feed Active</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.full_name?.split(' ')[0] || 'Sana'}! 👋
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              TechReel AI is continuously analyzing your scroll behavior, turning casual engagement into deep technology discovery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/explore"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/25 flex items-center space-x-2 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Reels</span>
            </Link>
            <button
              onClick={handleGenerateTodayPick}
              disabled={generating}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#141424] text-slate-200 hover:text-white border border-white/10 hover:border-violet-500/30 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${generating ? 'animate-spin' : ''}`} />
              <span>{generating ? 'Synthesizing...' : 'New Recommendation'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Current Interest Summary + Today's Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Current Inferred Interest Summary (4 cols) */}
        <div className="lg:col-span-5 bg-[#0E0E17] rounded-2xl border border-white/10 p-6 space-y-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2 text-violet-400">
                <Zap className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Current Interest Summary</h3>
              </div>
              <Link to="/interests" className="text-xs text-violet-400 hover:text-violet-300 font-medium">
                View Full
              </Link>
            </div>

            <p className="text-xs text-slate-400">
              Inferred from your watch time, likes, saves, and rewatches:
            </p>

            <div className="space-y-4">
              {primaryInterests.slice(0, 4).map((item, idx) => {
                const pct = Math.round(item.confidence * 100);
                return (
                  <div key={idx} className="space-y-1.5 bg-[#141424] p-3 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-200">{item.topic}</span>
                      <span className="text-cyan-400 font-bold">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>Overall Model Confidence:</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {interestProfile?.overall_confidence || 'High'}
            </span>
          </div>
        </div>

        {/* Right: Today's AI Recommendation (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-bold text-white">Today's AI Recommendation</h2>
            </div>
            <button
              onClick={() => setWhyModalOpen(true)}
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Why am I seeing this?</span>
            </button>
          </div>

          {topRecommendation ? (
            <RecommendationCard
              recommendation={topRecommendation}
              onFeedback={handleFeedback}
            />
          ) : (
            <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">No Recommendations Generated Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  Interact with a few reels or click below to trigger your first personalized technology discovery recommendation.
                </p>
              </div>
              <button
                onClick={handleGenerateTodayPick}
                disabled={generating}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-600/20"
              >
                {generating ? 'Generating...' : 'Generate First Recommendation'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-lg text-white">Sample Tech Reels</h3>
          </div>
          <Link
            to="/explore"
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center space-x-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentReels.map((reel) => (
            <div
              key={reel.id}
              className="bg-[#0E0E17] rounded-xl border border-white/10 p-4 space-y-3 hover:border-violet-500/40 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">
                    {reel.category}
                  </span>
                  <span className="text-[10px] text-slate-400">@{reel.creator}</span>
                </div>
                <h4 className="text-sm font-semibold text-white line-clamp-2 leading-snug">
                  {reel.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2">{reel.description}</p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {reel.duration_seconds}s • {reel.difficulty}
                </span>
                <button
                  onClick={() => {
                    setActivePlayerReelId(reel.id);
                    setIsPlayerOpen(true);
                  }}
                  className="px-2.5 py-1 rounded bg-[#141424] hover:bg-violet-600/30 text-slate-200 text-xs font-semibold transition-colors flex items-center space-x-1"
                >
                  <Play className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                  <span>Play Reel</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Reel Player Modal */}
      {isPlayerOpen && recentReels.length > 0 && (
        <ReelPlayerModal
          reels={recentReels}
          initialReelId={activePlayerReelId}
          isOpen={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
          onInteractionChange={async (reelId, data) => {
            await reelAPI.recordInteraction(reelId, data);
            const intRes = await interestAPI.getProfile().catch(() => ({ data: null }));
            if (intRes?.data) setInterestProfile(intRes.data);
          }}
        />
      )}

      {/* "Why am I seeing this?" Explanation Modal */}
      {whyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0E0E17] border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-base">
                <Info className="w-5 h-5" />
                <span>Why am I seeing this recommendation?</span>
              </div>
              <button
                onClick={() => setWhyModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-medium"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong className="text-white">Underlying Interest Inference:</strong> When you watch, like, save, or rewatch reels (such as developer humor, coding interview challenges, or hardware specs), TechReel AI synthesizes those into broad engineering domains instead of repetitive surface keywords.
              </p>
              <p>
                <strong className="text-white">Hype Filtering:</strong> We penalize promotional clickbait ("Make $10k in 7 days") and surface authoritative, educational concepts (system design, REST architecture, algorithms, and distributed systems).
              </p>
              <p>
                <strong className="text-white">Exploration vs Exploitation:</strong> We introduce useful adjacent engineering topics that help you grow as a student and software developer.
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setWhyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
