import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, Check, ArrowRight, Layers, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { preferencesAPI, profileAPI } from '../services/api';

export const Onboarding: React.FC = () => {
  const { user, profile, preferences, updateUserContext } = useAuth();
  const navigate = useNavigate();

  const availableTopics = [
    'AI',
    'Programming',
    'Java',
    'Python',
    'DSA',
    'Web Development',
    'System Design',
    'Cybersecurity',
    'Cloud',
    'DevOps',
    'Databases',
    'Networking',
    'Hardware',
    'Career',
    'Game Development',
  ];

  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    preferences?.selected_initial_topics || ['Programming', 'Software Engineering', 'AI']
  );
  const [saving, setSaving] = useState(false);

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleFinish = async (topics: string[]) => {
    setSaving(true);
    try {
      // Save preferences
      const prefRes = await preferencesAPI.updatePreferences({
        selected_initial_topics: topics,
      });

      // Mark onboarding as completed
      const profRes = await profileAPI.updateProfile({
        onboarding_completed: true,
      });

      updateUserContext({
        preferences: prefRes.data,
        profile: profRes.data?.profile,
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      navigate('/dashboard', { replace: true });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06060A] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-violet-600 selection:text-white">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-violet-600/15 via-cyan-500/10 to-transparent blur-[120px] pointer-events-none" />

      <div className="max-w-2xl mx-auto w-full space-y-8 relative">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#141424] border border-violet-500/30 text-xs font-semibold text-violet-400">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Step 1 of 1 • Initial Calibration</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome to TechReel AI, {user?.full_name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Let's understand what technology topics interest you. These serve as initial seed signals; your actual scrolling behavior and video interactions will dynamically evolve your model over time.
          </p>
        </div>

        <div className="bg-[#0E0E17] p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Starting Topics ({selectedTopics.length} selected)
            </span>
            <button
              onClick={() => setSelectedTopics(availableTopics)}
              className="text-xs text-violet-400 hover:text-violet-300 font-medium"
            >
              Select All
            </button>
          </div>

          {/* Topics Chip Grid */}
          <div className="flex flex-wrap gap-2.5">
            {availableTopics.map((topic) => {
              const isSelected = selectedTopics.includes(topic);
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggleTopic(topic)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all duration-200 flex items-center space-x-2 ${
                    isSelected
                      ? 'bg-violet-600/30 text-violet-200 border-violet-500 shadow-md shadow-violet-600/20'
                      : 'bg-[#141424] text-slate-400 border-white/5 hover:text-slate-200 hover:border-white/20'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                      isSelected ? 'bg-violet-500 text-white' : 'bg-slate-800 text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{topic}</span>
                </button>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-slate-300">
            🔒 <strong>AI Privacy Promise:</strong> We do not track personal social logins. All recommendations are computed strictly from interaction signals in this app.
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10 gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleFinish([])}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-[#141424] border border-white/10 transition-colors"
            >
              Skip for now
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleFinish(selectedTopics)}
              className="px-7 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/25 flex items-center space-x-2 transition-all duration-200 disabled:opacity-50"
            >
              <span>{saving ? 'Calibrating...' : 'Continue to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
