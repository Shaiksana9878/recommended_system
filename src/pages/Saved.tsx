import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Compass, Trash2, Play, Sparkles } from 'lucide-react';
import { savedAPI, reelAPI } from '../services/api';
import { Reel } from '../types';
import { ReelPlayerModal } from '../components/ReelPlayerModal';
import { LoadingState } from '../components/LoadingState';

export const Saved: React.FC = () => {
  const [savedReels, setSavedReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [activePlayerReelId, setActivePlayerReelId] = useState<number>(1);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await savedAPI.getSaved();
      if (res.success && res.data) {
        setSavedReels(res.data);
      }
    } catch (err) {
      console.error('Failed to load saved reels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleUnsave = async (reelId: number) => {
    try {
      await savedAPI.unsaveReel(reelId);
      setSavedReels((prev) => prev.filter((r) => r.id !== reelId));
    } catch (err) {
      console.error('Failed to unsave reel:', err);
    }
  };

  const handlePlayReel = (reelId: number) => {
    setActivePlayerReelId(reelId);
    setIsPlayerOpen(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingState message="Loading your saved reels..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 selection:bg-violet-600 selection:text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4 text-cyan-400" />
            <span>Saved Collection</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Saved Technology Reels ({savedReels.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Reels you have bookmarked to revisit later. Persisted permanently in MySQL.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {savedReels.length > 0 && (
            <button
              onClick={() => handlePlayReel(savedReels[0].id)}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20 flex items-center space-x-2 transition-all shrink-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play All Saved</span>
            </button>
          )}
          <Link
            to="/explore"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#141424] text-slate-200 hover:text-white border border-white/10 hover:border-violet-500/30 flex items-center space-x-2 transition-all shrink-0"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Explore More</span>
          </Link>
        </div>
      </div>

      {savedReels.length === 0 ? (
        <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-12 text-center space-y-4">
          <Bookmark className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Saved Reels</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Save reels you want to revisit later. Your saved collection also gives a very strong signal (+1.0) to your AI recommendation model.
          </p>
          <Link
            to="/explore"
            className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-600/20"
          >
            Explore Reels
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedReels.map((reel) => (
            <div
              key={reel.id}
              className="bg-[#0E0E17] rounded-2xl border border-white/10 overflow-hidden shadow-xl hover:border-violet-500/30 transition-all flex flex-col justify-between group"
            >
              <div
                onClick={() => handlePlayReel(reel.id)}
                className="relative aspect-video w-full bg-[#141424] cursor-pointer overflow-hidden"
              >
                {reel.thumbnail_url ? (
                  <img
                    src={reel.thumbnail_url}
                    alt={reel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-violet-950/20">
                    <Sparkles className="w-8 h-8 text-violet-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-violet-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-semibold text-violet-300">
                  {reel.category}
                </div>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] text-slate-300">
                  {reel.duration_seconds}s
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4
                    onClick={() => handlePlayReel(reel.id)}
                    className="font-semibold text-white text-sm line-clamp-2 hover:text-violet-300 cursor-pointer transition-colors"
                  >
                    {reel.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{reel.description}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    @{reel.creator} • {reel.difficulty}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePlayReel(reel.id)}
                      className="px-2.5 py-1 rounded bg-[#141424] hover:bg-violet-600/30 text-cyan-300 text-xs font-semibold flex items-center space-x-1"
                    >
                      <Play className="w-3 h-3 fill-cyan-400" />
                      <span>Play</span>
                    </button>
                    <Link
                      to={`/recommendations?reelId=${reel.id}`}
                      className="px-2.5 py-1 rounded bg-violet-600/20 text-violet-300 hover:bg-violet-600/40 text-xs font-semibold"
                    >
                      AI Bridge
                    </Link>
                    <button
                      onClick={() => handleUnsave(reel.id)}
                      className="p-1.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reel Player Modal */}
      {isPlayerOpen && savedReels.length > 0 && (
        <ReelPlayerModal
          reels={savedReels}
          initialReelId={activePlayerReelId}
          isOpen={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
          onInteractionChange={async (reelId, interactionData) => {
            await reelAPI.recordInteraction(reelId, interactionData);
            if (interactionData.saved === false) {
              setSavedReels((prev) => prev.filter((r) => r.id !== reelId));
            }
          }}
        />
      )}
    </div>
  );
};
