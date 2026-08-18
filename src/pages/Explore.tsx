import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Sparkles,
  Zap,
  CheckCircle2,
  Compass,
  Layers,
  ArrowRight,
  Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reelAPI, recommendationAPI } from '../services/api';
import { Reel } from '../types';
import { ReelCard } from '../components/ReelCard';
import { ReelPlayerModal } from '../components/ReelPlayerModal';
import { LoadingState } from '../components/LoadingState';

export const Explore: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get('difficulty') || 'All');
  const [analyzing, setAnalyzing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Player State
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [activePlayerReelId, setActivePlayerReelId] = useState<number>(1);

  const categories = [
    'All',
    'Programming',
    'Career',
    'Hardware',
    'AI',
    'System Design',
    'Technology',
    'Gaming',
    'Databases',
  ];

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const fetchReels = async () => {
    try {
      setLoading(true);
      const res = await reelAPI.getAllReels({
        q: searchQuery || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
      });
      if (res.success && res.data) {
        setReels(res.data);
        
        // If an initial id param was passed in URL, open the player
        const targetId = searchParams.get('id') || searchParams.get('reelId');
        if (targetId) {
          const numId = parseInt(targetId, 10);
          if (numId) {
            setActivePlayerReelId(numId);
            setIsPlayerOpen(true);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load reels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, [selectedCategory, selectedDifficulty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReels();
  };

  const handleInteractionChange = async (reelId: number, interactionData: any) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      // Optimistically update local reel state
      setReels((prev) =>
        prev.map((r) => {
          if (r.id === reelId) {
            return {
              ...r,
              isLiked: interactionData.liked !== undefined ? interactionData.liked : r.isLiked,
              isSaved: interactionData.saved !== undefined ? interactionData.saved : r.isSaved,
              userInteraction: {
                ...(r.userInteraction || { user_id: user.id, reel_id: reelId, created_at: new Date().toISOString() }),
                ...interactionData,
              },
            };
          }
          return r;
        })
      );

      await reelAPI.recordInteraction(reelId, interactionData);
      setToastMessage('Signal logged & stored in MySQL. AI interest model tuned!');
      setTimeout(() => setToastMessage(null), 2500);
    } catch (err) {
      console.error('Failed to record interaction:', err);
    }
  };

  const handleInspectAI = (reel: Reel) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/recommendations?reelId=${reel.id}`);
  };

  const handlePlayReel = (reel: Reel) => {
    setActivePlayerReelId(reel.id);
    setIsPlayerOpen(true);
  };

  const handleQuickAnalyze = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAnalyzing(true);
    try {
      await recommendationAPI.generate(null);
      navigate('/recommendations');
    } catch (err) {
      console.error('Failed to generate recommendations:', err);
      navigate('/recommendations');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 selection:bg-violet-600 selection:text-white">
      {/* Header & Mission Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Interactive Reel Stream</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Explore Tech & Student Reels
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Watch, like, save, or adjust watch-time sliders. Every interaction informs your deeper technology recommendation profile.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {reels.length > 0 && (
            <button
              onClick={() => {
                setActivePlayerReelId(reels[0].id);
                setIsPlayerOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#141424] text-cyan-300 hover:text-white border border-cyan-500/30 hover:bg-cyan-500/10 shadow-lg flex items-center space-x-2 transition-all shrink-0"
            >
              <Play className="w-4 h-4 fill-cyan-400 text-cyan-400" />
              <span>Launch Reel Stream</span>
            </button>
          )}

          {user && (
            <button
              onClick={handleQuickAnalyze}
              disabled={analyzing}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:from-violet-500 hover:to-cyan-400 shadow-lg shadow-violet-600/25 flex items-center space-x-2 transition-all shrink-0 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{analyzing ? 'Synthesizing...' : 'Synthesize AI Recommendations'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-4 space-y-4 shadow-xl">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search technology content (e.g., Java, AI, DSA, Cloud, System Design, MacBook)..."
            className="w-full pl-10 pr-24 py-2.5 bg-[#141424] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
          >
            Search
          </button>
        </form>

        {/* Categories Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Filter By Category:</span>
            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-[11px] text-violet-400 hover:underline"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  selectedCategory === cat
                    ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/20'
                    : 'bg-[#141424] text-slate-400 border-white/5 hover:text-white hover:border-white/15'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center space-x-2 pt-2 border-t border-white/5 text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            Difficulty:
          </span>
          <div className="flex gap-1.5">
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                  selectedDifficulty === diff
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-[#141424] text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-violet-600 text-white text-xs font-medium rounded-xl flex items-center justify-between shadow-lg shadow-violet-600/30 animate-fadeIn">
          <span>{toastMessage}</span>
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )}

      {/* Reels Grid */}
      {loading ? (
        <LoadingState message="Loading available tech reels..." />
      ) : reels.length === 0 ? (
        <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-12 text-center space-y-4">
          <Compass className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Reels Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or reset the category filter to see all reels.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedDifficulty('All');
              fetchReels();
            }}
            className="px-4 py-2 rounded-xl bg-[#141424] text-xs font-semibold text-white border border-white/10"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reels.map((reel) => (
            <ReelCard
              key={reel.id}
              reel={reel}
              onInteractionChange={handleInteractionChange}
              onInspectAI={handleInspectAI}
              onPlayReel={handlePlayReel}
            />
          ))}
        </div>
      )}

      {/* Fullscreen Interactive Reel Player Modal */}
      {isPlayerOpen && reels.length > 0 && (
        <ReelPlayerModal
          reels={reels}
          initialReelId={activePlayerReelId}
          isOpen={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
          onInteractionChange={handleInteractionChange}
          onInspectAI={handleInspectAI}
        />
      )}
    </div>
  );
};
