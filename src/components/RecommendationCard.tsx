import React, { useState } from 'react';
import {
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Info,
  ShieldCheck,
  Zap,
  Tag,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Ban,
  Clock
} from 'lucide-react';
import { Recommendation } from '../types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onFeedback: (
    recommendationId: string,
    isUseful: boolean | null,
    reason?: string,
    comments?: string
  ) => Promise<void>;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onFeedback,
}) => {
  const [feedbackState, setFeedbackState] = useState<boolean | null>(
    recommendation.feedback?.is_useful ?? null
  );
  const [feedbackReason, setFeedbackReason] = useState<string | undefined>(
    recommendation.feedback?.feedback_reason
  );
  const [notInterestedModalOpen, setNotInterestedModalOpen] = useState(false);
  const [whyExpanded, setWhyExpanded] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleUseful = async (useful: boolean) => {
    setSubmitting(true);
    try {
      await onFeedback(recommendation.id, useful);
      setFeedbackState(useful);
      setToastMessage(useful ? "Marked as useful! Personalization updated." : "Noted. We'll adjust your recommendation model.");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReasonSubmit = async (reason: string) => {
    setSubmitting(true);
    try {
      await onFeedback(recommendation.id, false, reason);
      setFeedbackState(false);
      setFeedbackReason(reason);
      setNotInterestedModalOpen(false);
      if (reason === 'Not Interested') {
        setToastMessage("Got it. We'll show you less content like this.");
      } else {
        setToastMessage(`Feedback received: "${reason}". Recommendations adjusted.`);
      }
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setSubmitting(false);
    }
  };

  const getConfidenceBadge = (conf: 'High' | 'Medium' | 'Low') => {
    switch (conf) {
      case 'High':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Medium':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Low':
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  const getDifficultyBadge = (diff: 'Beginner' | 'Intermediate' | 'Advanced') => {
    switch (diff) {
      case 'Beginner':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'Intermediate':
        return 'bg-violet-500/15 text-violet-400 border-violet-500/30';
      case 'Advanced':
        return 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30';
    }
  };

  const notInterestedReasons = [
    'Not Relevant',
    'Too Easy',
    'Too Difficult',
    'Too Repetitive',
    'Too Promotional',
    'Not Interested'
  ];

  return (
    <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-5 sm:p-6 shadow-2xl space-y-5 relative overflow-hidden">
      {/* Top Banner Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-cyan-400 to-indigo-600" />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
              AI Recommendation Agent
            </span>
            <p className="text-[11px] text-slate-400">
              Deep interest inference from short-form behavioral signals
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {recommendation.hype_filtered && (
            <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Hype Filtered</span>
            </span>
          )}
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getConfidenceBadge(
              recommendation.confidence
            )}`}
          >
            Confidence: {recommendation.confidence}
          </span>
        </div>
      </div>

      {/* Structured Output Grid adhering strictly to Required Output Schema */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Context & Inferred Underlying Interest */}
        <div className="space-y-3.5 bg-[#141424]/60 rounded-xl p-4 border border-white/5">
          {/* CURRENT REEL */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              CURRENT REEL:
            </span>
            <p className="text-sm font-semibold text-slate-200 mt-0.5">
              {recommendation.current_reel_title || 'Recent Scrolling Engagement'}
            </p>
          </div>

          {/* INTEREST DETECTED */}
          <div>
            <span className="text-[11px] font-bold text-violet-400 tracking-wider uppercase flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>INTEREST DETECTED:</span>
            </span>
            <p className="text-base font-bold text-white mt-0.5">
              {recommendation.detected_interest}
            </p>
          </div>

          {/* WHY (EVIDENCE) */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              WHY:
            </span>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-[#0A0A12] p-2.5 rounded-lg border border-white/5">
              {recommendation.why_detected}
            </p>
          </div>
        </div>

        {/* Right Column: Recommended Tech Reel & Educational Connection */}
        <div className="space-y-3.5 bg-gradient-to-br from-violet-950/20 to-indigo-950/20 rounded-xl p-4 border border-violet-500/20">
          {/* RECOMMENDED TECH REEL */}
          <div>
            <span className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase">
              RECOMMENDED TECH REEL:
            </span>
            <h4 className="text-base font-bold text-white mt-0.5 leading-snug">
              {recommendation.recommended_title}
            </h4>
            {recommendation.recommended_description && (
              <p className="text-xs text-slate-300 mt-1">
                {recommendation.recommended_description}
              </p>
            )}
          </div>

          {/* CATEGORY & DIFFICULTY */}
          <div className="flex items-center space-x-3 pt-1">
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                CATEGORY:
              </span>
              <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                {recommendation.category}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                DIFFICULTY:
              </span>
              <span
                className={`inline-block mt-0.5 px-2.5 py-0.5 rounded text-xs font-semibold border ${getDifficultyBadge(
                  recommendation.difficulty
                )}`}
              >
                {recommendation.difficulty}
              </span>
            </div>
          </div>

          {/* WHY THIS RECOMMENDATION */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              WHY THIS RECOMMENDATION:
            </span>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed bg-[#0A0A12]/80 p-2.5 rounded-lg border border-white/5">
              {recommendation.why_recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Educational Value Highlight */}
      {recommendation.educational_value && (
        <div className="px-4 py-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-cyan-300 mr-1">Learning Takeaway:</span>
            {recommendation.educational_value}
          </div>
        </div>
      )}

      {/* Toast Notification if action taken */}
      {toastMessage && (
        <div className="px-3 py-2 rounded-lg bg-violet-600 text-white text-xs font-medium flex items-center justify-between animate-fadeIn">
          <span>{toastMessage}</span>
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )}

      {/* Feedback Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span>Was this recommendation useful?</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleUseful(true)}
            disabled={submitting}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              feedbackState === true
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${feedbackState === true ? 'fill-emerald-400' : ''}`} />
            <span>Useful</span>
          </button>

          <button
            onClick={() => handleUseful(false)}
            disabled={submitting}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              feedbackState === false && feedbackReason !== 'Not Interested'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>Not Useful</span>
          </button>

          <button
            onClick={() => setNotInterestedModalOpen(true)}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              feedbackReason === 'Not Interested'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200'
            }`}
          >
            <Ban className="w-3.5 h-3.5 text-amber-400" />
            <span>Not Interested</span>
          </button>
        </div>
      </div>

      {/* Modal for "Not Interested" or detailed feedback reasons */}
      {notInterestedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0E0E17] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div>
              <h4 className="text-base font-bold text-white">Help Tune Your AI Model</h4>
              <p className="text-xs text-slate-400 mt-1">
                Tell us why this recommendation isn't ideal so we can improve future tech suggestions.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {notInterestedReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => handleReasonSubmit(reason)}
                  className="px-3 py-2 rounded-lg bg-[#141424] hover:bg-violet-600/20 border border-white/5 hover:border-violet-500/30 text-xs text-slate-300 hover:text-white text-left transition-colors"
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setNotInterestedModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-white/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
