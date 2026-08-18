import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  FastForward,
  ChevronUp,
  ChevronDown,
  Heart,
  Bookmark,
  Share2,
  Sparkles,
  Code2,
  BookOpen,
  Activity,
  Check,
  Copy,
  Sliders,
  ShieldAlert,
  Clock,
  Flame,
  Radio,
  Zap
} from 'lucide-react';
import { Reel } from '../types';

interface ReelPlayerModalProps {
  reels: Reel[];
  initialReelId: number;
  isOpen: boolean;
  onClose: () => void;
  onInteractionChange: (reelId: number, interactionData: any) => Promise<void>;
  onInspectAI?: (reel: Reel) => void;
}

export const ReelPlayerModal: React.FC<ReelPlayerModalProps> = ({
  reels,
  initialReelId,
  isOpen,
  onClose,
  onInteractionChange,
  onInspectAI,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(45);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'code' | 'takeaways' | 'ai'>('code');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [shareFeedback, setShareFeedback] = useState<boolean>(false);
  const [heartAnim, setHeartAnim] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // Sync initial reel ID
  useEffect(() => {
    if (isOpen) {
      const idx = reels.findIndex((r) => r.id === initialReelId);
      setCurrentIndex(idx !== -1 ? idx : 0);
      setCurrentTime(0);
      setIsPlaying(true);
      setVideoError(false);
    }
  }, [isOpen, initialReelId, reels]);

  const currentReel: Reel | undefined = reels[currentIndex];

  // Local interaction states for active reel
  const [liked, setLiked] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);
  const [skipped, setSkipped] = useState<boolean>(false);
  const [rewatched, setRewatched] = useState<boolean>(false);
  const [watchPercentage, setWatchPercentage] = useState<number>(0);

  // Update states whenever active reel changes
  useEffect(() => {
    if (!currentReel) return;
    setLiked(currentReel.isLiked ?? false);
    setSaved(currentReel.isSaved ?? false);
    setShared(currentReel.userInteraction?.shared ?? false);
    setSkipped(currentReel.userInteraction?.skipped ?? false);
    setRewatched(currentReel.userInteraction?.rewatched ?? false);
    setWatchPercentage(currentReel.userInteraction?.watch_percentage ?? 0);
    setDuration(currentReel.duration_seconds || 45);
    setCurrentTime(0);
    setVideoError(false);
    setIsPlaying(true);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [currentIndex, currentReel]);

  // Handle Speech Narration
  const toggleSpeech = useCallback(() => {
    if (!window.speechSynthesis || !currentReel) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak =
      currentReel.narration_transcript ||
      `${currentReel.title}. ${currentReel.description}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, [isSpeaking, currentReel]);

  // Sync interaction to backend
  const syncInteraction = useCallback(
    async (updates: Partial<{
      watch_percentage: number;
      liked: boolean;
      saved: boolean;
      shared: boolean;
      skipped: boolean;
      rewatched: boolean;
    }>) => {
      if (!currentReel) return;
      const newPct = updates.watch_percentage ?? watchPercentage;
      await onInteractionChange(currentReel.id, {
        watch_percentage: newPct,
        liked: updates.liked ?? liked,
        saved: updates.saved ?? saved,
        shared: updates.shared ?? shared,
        skipped: updates.skipped ?? skipped,
        rewatched: updates.rewatched ?? rewatched,
      });
    },
    [currentReel, watchPercentage, liked, saved, shared, skipped, rewatched, onInteractionChange]
  );

  // Playback timer & simulated video progress
  useEffect(() => {
    if (!isOpen || !isPlaying || !currentReel) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    const intervalTime = 100; // ms
    const stepSeconds = (intervalTime / 1000) * playbackSpeed;

    timerIntervalRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        const nextTime = prev + stepSeconds;
        const totalDur = currentReel.duration_seconds || 45;

        // Calculate watch percentage
        const calculatedPct = Math.min(100, Math.round((nextTime / totalDur) * 100));
        setWatchPercentage((oldPct) => Math.max(oldPct, calculatedPct));

        if (nextTime >= totalDur) {
          // Reel completed!
          syncInteraction({ watch_percentage: 100 });
          if (autoAdvance && currentIndex < reels.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            return 0;
          } else {
            // Loop reel
            return 0;
          }
        }
        return nextTime;
      });
    }, intervalTime);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isOpen, isPlaying, playbackSpeed, currentReel, autoAdvance, currentIndex, reels.length, syncInteraction]);

  // Keyboard navigation & controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying((p) => !p);
          break;
        case 'ArrowUp':
        case 'k':
          e.preventDefault();
          handlePrev();
          break;
        case 'ArrowDown':
        case 'j':
          e.preventDefault();
          handleNext();
          break;
        case 'm':
          setIsMuted((m) => !m);
          break;
        case 'l':
          toggleLike();
          break;
        case 's':
          toggleSave();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, reels.length]);

  if (!isOpen || !currentReel) return null;

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((idx) => idx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((idx) => idx - 1);
    }
  };

  const toggleLike = () => {
    const next = !liked;
    setLiked(next);
    if (next) {
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 900);
      if (skipped) setSkipped(false);
    }
    syncInteraction({ liked: next, skipped: false });
  };

  const toggleSave = () => {
    const next = !saved;
    setSaved(next);
    if (next && skipped) setSkipped(false);
    syncInteraction({ saved: next, skipped: false });
  };

  const toggleShare = () => {
    const next = !shared;
    setShared(next);
    syncInteraction({ shared: next, skipped: false });
    navigator.clipboard?.writeText?.(window.location.href);
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 2000);
  };

  const toggleSkip = () => {
    setSkipped(true);
    setLiked(false);
    setSaved(false);
    setRewatched(false);
    syncInteraction({ skipped: true, liked: false, saved: false, rewatched: false, watch_percentage: 15 });
    handleNext();
  };

  const toggleRewatch = () => {
    setCurrentTime(0);
    setIsPlaying(true);
    setRewatched(true);
    setSkipped(false);
    syncInteraction({ rewatched: true, watch_percentage: 100, skipped: false });
  };

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    const totalDur = currentReel.duration_seconds || 45;
    const pct = Math.min(100, Math.round((seconds / totalDur) * 100));
    setWatchPercentage((old) => Math.max(old, pct));
    syncInteraction({ watch_percentage: pct });
  };

  const copyCode = () => {
    if (currentReel.code_snippet) {
      navigator.clipboard.writeText(currentReel.code_snippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Signal Strength computation
  const getSignalStrength = () => {
    if (skipped) return { label: 'Negative Signal (-0.8)', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    if (saved || shared) return { label: 'Very Strong Signal (+1.0)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (liked || rewatched || watchPercentage >= 80) return { label: 'Strong Signal (+0.8)', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
    if (watchPercentage >= 50) return { label: 'Medium Signal (+0.5)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Neutral Signal (+0.2)', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' };
  };

  const signal = getSignalStrength();
  const progressRatio = Math.min(1, currentTime / (currentReel.duration_seconds || 45));

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md animate-fadeIn select-none"
    >
      {/* Top Header Floating Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30 pointer-events-auto">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-black/70 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-xs text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-violet-300">TechReel Stream</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300 font-mono text-[11px]">
              {currentIndex + 1} / {reels.length}
            </span>
          </div>

          <div className={`hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${signal.color}`}>
            <Activity className="w-3.5 h-3.5" />
            <span>AI Signal: {signal.label}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Audio Speech Narration */}
          <button
            onClick={toggleSpeech}
            className={`p-2.5 rounded-full border backdrop-blur-md transition-all ${
              isSpeaking
                ? 'bg-cyan-500 text-black border-cyan-400 shadow-lg shadow-cyan-500/30'
                : 'bg-black/60 text-slate-200 border-white/10 hover:text-white hover:bg-white/10'
            }`}
            title="Read Script with AI Voice Narration"
          >
            <Radio className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
          </button>

          {/* Close Modal */}
          <button
            onClick={() => {
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              onClose();
            }}
            className="p-2.5 rounded-full bg-black/60 border border-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-colors"
            title="Close Player (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Reel Layout: Video Center + Side Details Panel */}
      <div className="w-full max-w-5xl h-[88vh] max-h-[850px] bg-[#0A0A12] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
        
        {/* Left/Center: Video Player Area (Shorts / Reel Aspect) */}
        <div className="relative flex-1 md:max-w-[420px] lg:max-w-[460px] h-full bg-black flex flex-col justify-between overflow-hidden group">
          
          {/* Animated Heart Popup */}
          {heartAnim && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-bounce">
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl scale-125 transition-transform" />
            </div>
          )}

          {/* Main Video Element / Interactive Canvas Stream */}
          <div
            className="relative w-full h-full flex items-center justify-center cursor-pointer overflow-hidden bg-gradient-to-b from-slate-950 via-[#0E0E18] to-slate-950"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {currentReel.video_url && !videoError ? (
              <video
                ref={videoRef}
                src={currentReel.video_url}
                poster={currentReel.thumbnail_url}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                loop
                muted={isMuted}
                onError={() => setVideoError(true)}
              />
            ) : (
              /* High-Tech Animated Code Simulation View (if video playback falls back) */
              <div className="w-full h-full p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#0c0c18] via-[#101026] to-[#080812]">
                <div className="absolute -right-20 -top-20 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

                {/* Animated Tech Terminal Header */}
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="ml-2 font-mono text-[10px] text-cyan-400">
                        {currentReel.code_language || 'tech_engine'}.v2
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 text-[10px] font-mono">
                      LIVE SIMULATION
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white leading-snug drop-shadow-md">
                    {currentReel.title}
                  </h2>
                </div>

                {/* Live Animated Code Terminal Stream */}
                <div className="relative z-10 my-auto bg-black/60 rounded-xl p-3.5 border border-white/10 font-mono text-xs text-cyan-300 overflow-hidden shadow-inner max-h-[300px]">
                  <pre className="text-[11px] leading-relaxed text-slate-200 overflow-x-auto whitespace-pre-wrap">
                    {currentReel.code_snippet || currentReel.description}
                  </pre>
                </div>

                {/* Real-time waveform simulation bar */}
                <div className="relative z-10 space-y-2 pt-2">
                  <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Concept Analysis Engine Active</span>
                  </div>
                  <div className="flex items-end space-x-1 h-6">
                    {[35, 75, 45, 90, 60, 85, 40, 95, 70, 50, 80, 65, 90, 40, 75].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-violet-600 to-cyan-400 rounded-t transition-all duration-300"
                        style={{
                          height: isPlaying ? `${(h * ((i % 3) + 1)) % 100}%` : '20%',
                          opacity: isPlaying ? 0.9 : 0.4,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Play/Pause Center Indicator */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                <div className="w-16 h-16 rounded-full bg-violet-600/90 text-white flex items-center justify-center shadow-2xl scale-110">
                  <Play className="w-8 h-8 ml-1 fill-current" />
                </div>
              </div>
            )}
          </div>

          {/* Right Action Rail (Vertical Buttons over video) */}
          <div className="absolute right-3 bottom-24 flex flex-col items-center space-y-3 z-30 pointer-events-auto">
            {/* Like */}
            <div className="flex flex-col items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike();
                }}
                className={`p-3 rounded-full border backdrop-blur-md transition-transform active:scale-90 ${
                  liked
                    ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/40'
                    : 'bg-black/60 text-white border-white/10 hover:bg-black/80'
                }`}
                title="Like Reel"
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-white' : ''}`} />
              </button>
              <span className="text-[10px] font-bold text-white mt-1 drop-shadow">
                {liked ? 'Liked' : 'Like'}
              </span>
            </div>

            {/* Save */}
            <div className="flex flex-col items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSave();
                }}
                className={`p-3 rounded-full border backdrop-blur-md transition-transform active:scale-90 ${
                  saved
                    ? 'bg-violet-600 text-white border-violet-400 shadow-lg shadow-violet-500/40'
                    : 'bg-black/60 text-white border-white/10 hover:bg-black/80'
                }`}
                title="Save to Collection"
              >
                <Bookmark className={`w-5 h-5 ${saved ? 'fill-white' : ''}`} />
              </button>
              <span className="text-[10px] font-bold text-white mt-1 drop-shadow">
                {saved ? 'Saved' : 'Save'}
              </span>
            </div>

            {/* Share */}
            <div className="flex flex-col items-center relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleShare();
                }}
                className={`p-3 rounded-full border backdrop-blur-md transition-transform active:scale-90 ${
                  shared
                    ? 'bg-cyan-500 text-black border-cyan-400'
                    : 'bg-black/60 text-white border-white/10 hover:bg-black/80'
                }`}
                title="Share Reel"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <span className="text-[10px] font-bold text-white mt-1 drop-shadow">Share</span>
              {shareFeedback && (
                <span className="absolute -left-16 top-2 bg-cyan-400 text-black text-[9px] font-extrabold px-2 py-0.5 rounded shadow whitespace-nowrap">
                  Copied!
                </span>
              )}
            </div>

            {/* Rewatch */}
            <div className="flex flex-col items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRewatch();
                }}
                className={`p-3 rounded-full border backdrop-blur-md transition-transform active:scale-90 ${
                  rewatched
                    ? 'bg-emerald-500 text-white border-emerald-400'
                    : 'bg-black/60 text-white border-white/10 hover:bg-black/80'
                }`}
                title="Rewatch (Strong Signal)"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <span className="text-[10px] font-bold text-white mt-1 drop-shadow">Rewatch</span>
            </div>

            {/* Skip */}
            <div className="flex flex-col items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSkip();
                }}
                className="p-3 rounded-full bg-black/60 text-slate-300 border border-white/10 hover:text-rose-400 hover:bg-rose-950/40 transition-transform active:scale-90"
                title="Skip to Next (-Signal)"
              >
                <FastForward className="w-5 h-5" />
              </button>
              <span className="text-[10px] font-bold text-slate-300 mt-1 drop-shadow">Skip</span>
            </div>

            {/* AI Bridge Inspect */}
            {onInspectAI && (
              <div className="flex flex-col items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onInspectAI(currentReel);
                  }}
                  className="p-3 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white border border-violet-400/50 shadow-lg shadow-violet-600/30 transition-transform active:scale-90"
                  title="Inspect AI Recommendation"
                >
                  <Sparkles className="w-5 h-5" />
                </button>
                <span className="text-[10px] font-bold text-cyan-300 mt-1 drop-shadow">AI Bridge</span>
              </div>
            )}
          </div>

          {/* Bottom Video Metadata Overlay */}
          <div className="absolute bottom-12 left-3 right-16 z-20 pointer-events-none">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white border border-white/10">
                  @{currentReel.creator}
                </span>
                <span className="px-2 py-0.5 rounded bg-violet-600/60 backdrop-blur-md text-[11px] font-medium text-violet-200">
                  {currentReel.category}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 backdrop-blur-md text-[11px] text-slate-200">
                  {currentReel.difficulty}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight drop-shadow-md line-clamp-2">
                {currentReel.title}
              </h3>
            </div>
          </div>

          {/* Scrubber & Player Controls Bar */}
          <div className="relative z-30 bg-black/80 backdrop-blur-md p-3 border-t border-white/10 space-y-2">
            {/* Range Scrubber */}
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono text-slate-300 min-w-[36px]">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={currentReel.duration_seconds || 45}
                step="0.5"
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <span className="text-[11px] font-mono text-slate-400 min-w-[36px] text-right">
                {formatTime(currentReel.duration_seconds || 45)}
              </span>
            </div>

            {/* Sub-bar Controls */}
            <div className="flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 hover:text-white rounded hover:bg-white/10"
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 hover:text-white rounded hover:bg-white/10"
                  title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>

                {/* Speed Toggle */}
                <button
                  onClick={() => {
                    const speeds = [1, 1.25, 1.5, 2];
                    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                    setPlaybackSpeed(speeds[nextIdx]);
                  }}
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[11px] font-mono font-semibold"
                  title="Playback Speed"
                >
                  {playbackSpeed}x
                </button>
              </div>

              {/* Up / Down Navigation Controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30"
                  title="Previous Reel (Up Arrow)"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === reels.length - 1}
                  className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30"
                  title="Next Reel (Down Arrow)"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Deep-Dive Panel (Desktop) */}
        <div className="flex-1 bg-[#0E0E17] flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 overflow-hidden">
          
          {/* Tab Navigation Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  activeTab === 'code'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'bg-[#141424] text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code & Architecture</span>
              </button>

              <button
                onClick={() => setActiveTab('takeaways')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  activeTab === 'takeaways'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'bg-[#141424] text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Key Takeaways</span>
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  activeTab === 'ai'
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'bg-[#141424] text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Diagnostics</span>
              </button>
            </div>
          </div>

          {/* Tab Content Area */}
          <div className="p-6 flex-1 overflow-y-auto space-y-4 text-slate-300 text-xs">
            {activeTab === 'code' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      Language:
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[11px] font-bold">
                      {currentReel.code_language || 'javascript'}
                    </span>
                  </div>

                  {currentReel.code_snippet && (
                    <button
                      onClick={copyCode}
                      className="px-3 py-1 rounded-lg bg-[#141424] text-slate-300 hover:text-white border border-white/10 flex items-center space-x-1.5 font-medium transition-colors"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  )}
                </div>

                {/* Code Box */}
                <div className="bg-[#080810] border border-white/10 rounded-2xl p-4 font-mono text-[12px] leading-relaxed text-cyan-200 overflow-x-auto shadow-inner">
                  <pre className="whitespace-pre-wrap">
                    {currentReel.code_snippet || currentReel.description}
                  </pre>
                </div>

                <div className="bg-[#141424] p-4 rounded-xl border border-white/5 space-y-1">
                  <h5 className="font-semibold text-white text-xs">Architectural Context:</h5>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    {currentReel.description}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'takeaways' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-violet-400 font-bold text-sm">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Student & Engineering Key Takeaways</span>
                </div>

                <div className="space-y-2.5">
                  {(currentReel.key_takeaways || [
                    "Focus on the underlying computer science fundamentals rather than transient buzzwords.",
                    "Practice writing clean, testable code with defensive bounds checks and error handling.",
                    "Understand time and space complexity trade-offs in distributed systems."
                  ]).map((point, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-3 bg-[#141424] p-3.5 rounded-xl border border-white/5"
                    >
                      <span className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-slate-300 leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>

                {currentReel.narration_transcript && (
                  <div className="p-4 bg-[#141424] rounded-xl border border-white/5 space-y-1.5">
                    <h6 className="font-semibold text-white text-xs flex items-center space-x-1.5">
                      <Radio className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Spoken Narration Script</span>
                    </h6>
                    <p className="text-slate-400 text-[11px] italic leading-relaxed">
                      "{currentReel.narration_transcript}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    <span>Real-Time Interaction Weight Matrix</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${signal.color}`}>
                    {signal.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#141424] p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Watch Progress</span>
                    <p className="text-lg font-extrabold text-white">{watchPercentage}%</p>
                    <span className="text-[10px] text-cyan-400">Weight: +{(watchPercentage / 100).toFixed(2)}</span>
                  </div>

                  <div className="bg-[#141424] p-3 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Saved / Liked</span>
                    <p className="text-lg font-extrabold text-white">
                      {saved ? 'Saved (+1.0)' : liked ? 'Liked (+0.8)' : 'None (0.0)'}
                    </p>
                    <span className="text-[10px] text-emerald-400">High intent signal</span>
                  </div>
                </div>

                <div className="bg-[#141424] p-4 rounded-xl border border-white/5 space-y-2">
                  <h6 className="font-semibold text-white text-xs">AI Inference Insight:</h6>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Watching and saving <strong className="text-slate-200">{currentReel.title}</strong> signals deep interest in <strong className="text-violet-300">#{currentReel.category}</strong> and related software architecture topics. Click below to generate tailored recommendations.
                  </p>
                  {onInspectAI && (
                    <button
                      onClick={() => onInspectAI(currentReel)}
                      className="w-full mt-2 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold text-xs hover:from-violet-500 hover:to-cyan-400 shadow-md shadow-violet-600/25 flex items-center justify-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Synthesize Next Recommendation</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation Strip */}
          <div className="p-4 border-t border-white/10 bg-[#0A0A12] flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-400">
              <span className="text-[11px]">Auto-Advance:</span>
              <button
                onClick={() => setAutoAdvance(!autoAdvance)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                  autoAdvance
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-[#141424] text-slate-500 border-white/10'
                }`}
              >
                {autoAdvance ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-3 py-1.5 rounded-xl bg-[#141424] text-white hover:bg-white/10 disabled:opacity-40 font-semibold"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === reels.length - 1}
                className="px-4 py-1.5 rounded-xl bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40 font-bold shadow-md shadow-violet-600/20"
              >
                Next Reel
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
