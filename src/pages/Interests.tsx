import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Sparkles,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Brain,
  Layers,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { interestAPI } from '../services/api';
import { InterestProfile } from '../types';
import { InterestCard } from '../components/InterestCard';
import { LoadingState } from '../components/LoadingState';

export const Interests: React.FC = () => {
  const [profile, setProfile] = useState<InterestProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchInterestProfile = async () => {
    try {
      setLoading(true);
      const res = await interestAPI.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error('Failed to load interest profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterestProfile();
  }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await interestAPI.analyze(null);
      if (res.success && res.data?.interestProfile) {
        setProfile(res.data.interestProfile);
        setToastMessage('AI interest model re-evaluated against your latest scrolling activity.');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to analyze interests:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await interestAPI.reset();
      if (res.success && res.data) {
        setProfile(res.data);
        setResetModalOpen(false);
        setToastMessage('Inferred interest profile reset. Fresh interactions will build a new model.');
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (err) {
      console.error('Failed to reset interest profile:', err);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingState message="Loading your AI interest profile..." />
      </div>
    );
  }

  const primaryInterests = profile?.primary_interests || [];
  const secondaryInterests = profile?.secondary_interests || ['Developer Hardware', 'Coding Interviews', 'Databases'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 selection:bg-violet-600 selection:text-white">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>AI Knowledge Profile</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            My Inferred Technology Interests
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            This evolving interest profile is computed by analyzing your watch time, saves, shares, and rewatches across reels.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setResetModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#141424] text-slate-300 hover:text-white border border-white/10 hover:border-rose-500/30 flex items-center space-x-2 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset Profile</span>
          </button>

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/25 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Analyzing...' : 'Re-Analyze Interests'}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 bg-violet-600 text-white text-xs font-medium rounded-xl flex items-center justify-between shadow-lg shadow-violet-600/30 animate-fadeIn">
          <span>{toastMessage}</span>
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )}

      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-5 space-y-1.5 shadow-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Model Confidence
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">
              {profile?.overall_confidence || 'High'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Verified
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Based on multi-interaction weighted signals</p>
        </div>

        <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-5 space-y-1.5 shadow-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Profile Version
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">v{profile?.version || 1}.0</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Adaptive
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Incrementally tuned after each batch</p>
        </div>

        <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-5 space-y-1.5 shadow-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Signals Logged
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">
              {profile?.totalInteractions || 8} Interactions
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Persisted durably in MySQL schema</p>
        </div>
      </div>

      {/* Primary Inferred Interests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-bold text-white">Primary Underlying Technology Interests</h2>
          </div>
          <span className="text-xs text-slate-400">Ranked by signal weight</span>
        </div>

        {primaryInterests.length === 0 ? (
          <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-8 text-center space-y-3">
            <Zap className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-white">No Inferred Interests Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start exploring reels and adjusting watch sliders to let Claude infer your technology goals.
            </p>
            <Link
              to="/explore"
              className="inline-block px-5 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-500"
            >
              Explore Reels
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {primaryInterests.map((item, idx) => (
              <InterestCard key={idx} item={item} rank={idx + 1} />
            ))}
          </div>
        )}
      </div>

      {/* Secondary & Adjacent Topics */}
      <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-6 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 text-cyan-400">
          <Layers className="w-4 h-4" />
          <h3 className="text-base font-bold text-white">Secondary & Adjacent Discovery Topics</h3>
        </div>
        <p className="text-xs text-slate-400">
          Topics identified as promising exploration candidates that connect to your core interests:
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {secondaryInterests.map((topic, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-xl bg-[#141424] border border-white/10 text-xs font-medium text-slate-300 hover:border-cyan-500/40 transition-colors"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* AI Narrative Breakdown */}
      {profile?.raw_analysis_summary && (
        <div className="bg-gradient-to-br from-violet-950/20 to-indigo-950/20 rounded-2xl border border-violet-500/20 p-6 space-y-2">
          <div className="flex items-center space-x-2 text-violet-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Reasoning Analysis</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {profile.raw_analysis_summary}
          </p>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0E0E17] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Reset Interest Profile</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your inferred interest profile will be reset. Your account and Reel interaction history can remain. Future interactions will build a new personalized model from scratch.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-[#141424]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resetting}
                onClick={handleReset}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-600/20"
              >
                {resetting ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
