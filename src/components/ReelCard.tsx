import React, { useState } from 'react';
import {
  Heart,
  Bookmark,
  Share2,
  FastForward,
  RotateCcw,
  Play,
  Check,
  Flame,
  ShieldAlert,
  Sparkles,
  Layers,
  Clock
} from 'lucide-react';
import { Reel } from '../types';

interface ReelCardProps {
  reel: Reel;
  onInteractionChange: (reelId: number, interactionData: any) => Promise<void>;
  onInspectAI?: (reel: Reel) => void;
  onPlayReel?: (reel: Reel) => void;
}

export const ReelCard: React.FC<ReelCardProps> = ({
  reel,
  onInteractionChange,
  onInspectAI,
  onPlayReel,
}) => {
  const [watchPercentage, setWatchPercentage] = useState<number>(
    reel.userInteraction?.watch_percentage ?? 85
  );
  const [liked, setLiked] = useState<boolean>(reel.isLiked ?? false);
  const [saved, setSaved] = useState<boolean>(reel.isSaved ?? false);
  const [shared, setShared] = useState<boolean>(reel.userInteraction?.shared ?? false);
  const [skipped, setSkipped] = useState<boolean>(reel.userInteraction?.skipped ?? false);
  const [rewatched, setRewatched] = useState<boolean>(reel.userInteraction?.rewatched ?? false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Compute live signal strength
  const getSignalStrength = () => {
    if (skipped) return { label: 'Negative Signal', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    if (saved || shared) return { label: 'Very Strong Signal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (liked || rewatched || watchPercentage >= 80) return { label: 'Strong Signal', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
    if (watchPercentage >= 50) return { label: 'Medium Signal', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Weak Signal', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' };
  };

  const triggerUpdate = async (updates: Partial<{
    watch_percentage: number;
    liked: boolean;
    saved: boolean;
    shared: boolean;
    skipped: boolean;
    rewatched: boolean;
  }>) => {
    setIsUpdating(true);
    try {
      await onInteractionChange(reel.id, {
        watch_percentage: updates.watch_percentage ?? watchPercentage,
        liked: updates.liked ?? liked,
        saved: updates.saved ?? saved,
        shared: updates.shared ?? shared,
        skipped: updates.skipped ?? skipped,
        rewatched: updates.rewatched ?? rewatched,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleLike = () => {
    const next = !liked;
    setLiked(next);
    if (next && skipped) setSkipped(false);
    triggerUpdate({ liked: next, skipped: false });
  };

  const toggleSave = () => {
    const next = !saved;
    setSaved(next);
    if (next && skipped) setSkipped(false);
    triggerUpdate({ saved: next, skipped: false });
  };

  const toggleShare = () => {
    const next = !shared;
    setShared(next);
    triggerUpdate({ shared: next, skipped: false });
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const toggleSkip = () => {
    const next = !skipped;
    setSkipped(next);
    if (next) {
      setLiked(false);
      setSaved(false);
      setRewatched(false);
      setWatchPercentage(15);
      triggerUpdate({ skipped: true, liked: false, saved: false, rewatched: false, watch_percentage: 15 });
    } else {
      triggerUpdate({ skipped: false });
    }
  };

  const toggleRewatch = () => {
    const next = !rewatched;
    setRewatched(next);
    if (next) {
      setWatchPercentage(100);
      setSkipped(false);
      triggerUpdate({ rewatched: true, watch_percentage: 100, skipped: false });
    } else {
      triggerUpdate({ rewatched: false });
    }
  };

  const handleSliderChange = (val: number) => {
    setWatchPercentage(val);
    if (val >= 80 && skipped) setSkipped(false);
    triggerUpdate({ watch_percentage: val, skipped: val < 20 ? skipped : false });
  };

  const signal = getSignalStrength();
  const isHype = (reel.hype_score || 0) > 0.6;

  return (
    <div className="flex flex-col bg-[#0E0E17] rounded-2xl border border-white/10 hover:border-violet-500/30 transition-all duration-300 overflow-hidden shadow-xl group">
      {/* Video Simulation / Thumbnail Container */}
      <div
        className="relative aspect-video w-full bg-[#141424] overflow-hidden cursor-pointer"
        onClick={() => onPlayReel ? onPlayReel(reel) : setIsPlaying(!isPlaying)}
      >
        {reel.thumbnail_url ? (
          <img
            src={reel.thumbnail_url}
            alt={reel.title}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isPlaying ? 'scale-105 filter brightness-95' : 'group-hover:scale-105'
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-violet-950/20">
            <Sparkles className="w-10 h-10 text-violet-400" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E17] via-transparent to-black/40" />

        {/* Creator & Duration Overlay */}
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-medium text-slate-200 border border-white/10">
            @{reel.creator}
          </span>
          {isHype && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold flex items-center space-x-1">
              <ShieldAlert className="w-3 h-3" />
              <span>Hype Detected</span>
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] text-slate-300 border border-white/10">
          <Clock className="w-3 h-3 text-cyan-400 mr-1" />
          <span>{reel.duration_seconds}s</span>
        </div>

        {/* Play/Simulate overlay button */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20"
        >
          <div className="w-12 h-12 rounded-full bg-violet-600/90 text-white flex items-center justify-center shadow-lg shadow-violet-500/30 hover:scale-110 transition-transform">
            <Play className="w-5 h-5 ml-0.5 fill-current" />
          </div>
        </div>

        {/* Category & Difficulty Badge */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[11px] font-medium">
            {reel.category}
          </span>
          <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-[11px]">
            {reel.difficulty}
          </span>
        </div>
      </div>

      {/* Reel Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3
            onClick={() => onPlayReel && onPlayReel(reel)}
            className="font-semibold text-white text-base leading-snug group-hover:text-violet-300 transition-colors line-clamp-2 cursor-pointer"
          >
            {reel.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {reel.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {reel.tags.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#181828] text-slate-300 border border-white/5"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Interactive Watch Simulator Scrubber */}
        <div className="pt-2 border-t border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center space-x-1">
              <span>Watch Progress:</span>
              <strong className="text-slate-200 font-semibold">{watchPercentage}%</strong>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${signal.color}`}>
              {signal.label}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={watchPercentage}
            onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
        </div>

        {/* Interaction Action Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Like */}
            <button
              onClick={toggleLike}
              title={liked ? "Unlike" : "Like (Strong Signal)"}
              className={`p-2 rounded-lg border transition-all ${
                liked
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-500/20'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
            </button>

            {/* Save */}
            <button
              onClick={toggleSave}
              title={saved ? "Unsave" : "Save (Very Strong Signal)"}
              className={`p-2 rounded-lg border transition-all ${
                saved
                  ? 'bg-violet-500/20 text-violet-400 border-violet-500/40 shadow-sm shadow-violet-500/20'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-violet-400' : ''}`} />
            </button>

            {/* Share */}
            <button
              onClick={toggleShare}
              title="Share (Very Strong Signal)"
              className={`p-2 rounded-lg border transition-all relative ${
                shared
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
              }`}
            >
              <Share2 className="w-4 h-4" />
              {copiedNotification && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                  Shared!
                </span>
              )}
            </button>

            {/* Rewatch */}
            <button
              onClick={toggleRewatch}
              title="Rewatch (Strong Signal)"
              className={`p-2 rounded-lg border transition-all ${
                rewatched
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Skip */}
            <button
              onClick={toggleSkip}
              title="Skip (Negative Signal)"
              className={`p-2 rounded-lg border transition-all ${
                skipped
                  ? 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
              }`}
            >
              <FastForward className="w-4 h-4" />
            </button>
          </div>

          {onInspectAI && (
            <button
              onClick={() => onInspectAI(reel)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-violet-600/15 border border-violet-500/30 text-violet-300 hover:bg-violet-600/30 text-xs font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">AI Bridge</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
