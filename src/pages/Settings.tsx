import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sliders, RotateCcw, Trash2, CheckCircle2, ShieldAlert, Zap, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { preferencesAPI, interestAPI, profileAPI } from '../services/api';
import { LoadingState } from '../components/LoadingState';

export const Settings: React.FC = () => {
  const { preferences, updateUserContext, logout } = useAuth();
  const navigate = useNavigate();

  const [contentStyle, setContentStyle] = useState(preferences?.content_style || 'Mixed');
  const [defaultDifficulty, setDefaultDifficulty] = useState(preferences?.default_difficulty || 'Adaptive');
  const [personalizationEnabled, setPersonalizationEnabled] = useState(
    preferences?.personalization_enabled ?? true
  );
  const [excludedTopicsInput, setExcludedTopicsInput] = useState(
    (preferences?.excluded_topics || []).join(', ')
  );

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        setLoading(true);
        const res = await preferencesAPI.getPreferences();
        if (res.success && res.data) {
          setContentStyle(res.data.content_style);
          setDefaultDifficulty(res.data.default_difficulty);
          setPersonalizationEnabled(res.data.personalization_enabled);
          setExcludedTopicsInput((res.data.excluded_topics || []).join(', '));
        }
      } catch (err) {
        console.error('Failed to load preferences:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, []);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const excludedArray = excludedTopicsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await preferencesAPI.updatePreferences({
        content_style: contentStyle,
        default_difficulty: defaultDifficulty,
        personalization_enabled: personalizationEnabled,
        excluded_topics: excludedArray,
      });

      if (res.success && res.data) {
        updateUserContext({ preferences: res.data });
        setToastMessage('Recommendation preferences saved and active.');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetProfile = async () => {
    setResetting(true);
    try {
      await interestAPI.reset();
      setResetModalOpen(false);
      setToastMessage('Interest profile reset. A new profile will be constructed from future scrolls.');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Failed to reset:', err);
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await profileAPI.deleteAccount();
      setDeleteModalOpen(false);
      logout();
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Failed to delete account:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <LoadingState message="Loading application settings..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 selection:bg-violet-600 selection:text-white">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center space-x-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Configuration</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Recommendation & Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Tune recommendation sensitivity, difficulty levels, and data privacy options.
        </p>
      </div>

      {toastMessage && (
        <div className="p-3.5 bg-violet-600 text-white text-xs font-medium rounded-xl flex items-center justify-between shadow-lg shadow-violet-600/30 animate-fadeIn">
          <span>{toastMessage}</span>
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )}

      {/* Preferences Form */}
      <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
        <h3 className="text-base font-bold text-white border-b border-white/10 pb-3">
          AI Feed Customization
        </h3>

        <form onSubmit={handleSavePreferences} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Content Style Focus
              </label>
              <select
                value={contentStyle}
                onChange={(e) => setContentStyle(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-[#141424] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
              >
                <option value="Mixed">Mixed (Balanced Theory, Engineering & Humor)</option>
                <option value="Technical">Strictly Technical (Deep Architecture & Code)</option>
                <option value="Educational">Educational (Tutorials & Guided Explanations)</option>
                <option value="Career">Career & Interview Focused</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Default Difficulty
              </label>
              <select
                value={defaultDifficulty}
                onChange={(e) => setDefaultDifficulty(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-[#141424] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
              >
                <option value="Adaptive">Adaptive (AI Scales to Your Interaction Depth)</option>
                <option value="Beginner">Beginner (Foundational Concepts)</option>
                <option value="Intermediate">Intermediate (Real-world Implementations)</option>
                <option value="Advanced">Advanced (High-scale & Distributed Systems)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Excluded Topics (Comma-separated)
            </label>
            <input
              type="text"
              value={excludedTopicsInput}
              onChange={(e) => setExcludedTopicsInput(e.target.value)}
              placeholder="e.g. Crypto, Dropshipping, Mobile Games"
              className="w-full px-4 py-2.5 bg-[#141424] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              TechReel AI will avoid recommending content matching these topics.
            </p>
          </div>

          {/* Personalization Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#141424] rounded-xl border border-white/5">
            <div>
              <h4 className="text-sm font-semibold text-white">Enable Behavioral Personalization</h4>
              <p className="text-xs text-slate-400">
                Allow AI to analyze watch time %, saves, and likes to adapt recommendations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPersonalizationEnabled(!personalizationEnabled)}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                personalizationEnabled ? 'bg-violet-600 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Reset Interest Profile & Delete Account */}
      <div className="bg-[#0E0E17] rounded-2xl border border-rose-500/20 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center space-x-2 text-rose-400">
          <ShieldAlert className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Data Management & Danger Zone</h3>
        </div>

        <div className="divide-y divide-white/5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <h4 className="text-sm font-semibold text-white">Reset Interest Profile</h4>
              <p className="text-xs text-slate-400">
                Clear all inferred interest scores and start with a blank AI model. Your saved reels remain intact.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setResetModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#141424] hover:bg-rose-500/10 text-rose-300 border border-rose-500/20 shrink-0"
            >
              Reset Interests
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
            <div>
              <h4 className="text-sm font-semibold text-rose-400">Delete Student Account</h4>
              <p className="text-xs text-slate-400">
                Permanently erase your account, all interaction logs, recommendations, and saved bookmarks from the database.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 shrink-0"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0E0E17] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Confirm Interest Reset</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your inferred interest profile will be reset. Your account and Reel interaction history can remain. Future interactions will build a new personalized model from scratch.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-[#141424]"
              >
                Cancel
              </button>
              <button
                disabled={resetting}
                onClick={handleResetProfile}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500"
              >
                {resetting ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0E0E17] border border-rose-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Permanent Account Deletion</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure? This action cannot be undone. All your profile data, saved reels, interest models, and recommendation history will be permanently erased.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-[#141424]"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDeleteAccount}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500"
              >
                {deleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
