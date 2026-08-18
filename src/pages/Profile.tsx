import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, BookOpen, Target, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import { LoadingState } from '../components/LoadingState';

export const Profile: React.FC = () => {
  const { user, profile, updateUserContext } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [educationLevel, setEducationLevel] = useState(profile?.education_level || 'Undergraduate');
  const [primaryGoal, setPrimaryGoal] = useState(profile?.primary_goal || 'Explore Tech & Career Growth');
  const [stats, setStats] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        const res = await profileAPI.getProfile();
        if (res.success && res.data) {
          setFullName(res.data.user.full_name);
          setBio(res.data.profile.bio);
          setEducationLevel(res.data.profile.education_level);
          setPrimaryGoal(res.data.profile.primary_goal);
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfileData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await profileAPI.updateProfile({
        full_name: fullName,
        bio,
        education_level: educationLevel,
        primary_goal: primaryGoal,
      });

      if (res.success && res.data) {
        updateUserContext({
          user: res.data.user,
          profile: res.data.profile,
        });
        setToastMessage('Profile updated and persisted successfully.');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <LoadingState message="Loading profile..." />
      </div>
    );
  }

  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName || 'User')}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 selection:bg-violet-600 selection:text-white">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center space-x-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
          <User className="w-4 h-4 text-cyan-400" />
          <span>Student Account</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          User Profile & Learning Goals
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your personal details, academic focus, and career milestones.
        </p>
      </div>

      {toastMessage && (
        <div className="p-3.5 bg-violet-600 text-white text-xs font-medium rounded-xl flex items-center justify-between shadow-lg shadow-violet-600/30 animate-fadeIn">
          <span>{toastMessage}</span>
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )}

      {/* Profile Overview Card & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-6 flex flex-col items-center text-center space-y-4 shadow-xl">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-24 h-24 rounded-full bg-[#141424] border-2 border-violet-500/40 shadow-xl"
          />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">{fullName}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Role: Student
            </span>
          </div>

          <div className="w-full pt-3 border-t border-white/5 text-xs text-slate-400 flex items-center justify-center space-x-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Member Since: {new Date(user?.created_at || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Stats 2 cols */}
        <div className="md:col-span-2 bg-[#0E0E17] rounded-2xl border border-white/10 p-6 flex flex-col justify-between shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            Engagement & Personalization Metrics
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#141424] p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400">Total Reel Signals</span>
              <p className="text-2xl font-extrabold text-white">{stats?.totalInteractions || 0}</p>
            </div>
            <div className="bg-[#141424] p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400">Saved Bookmarks</span>
              <p className="text-2xl font-extrabold text-cyan-400">{stats?.savedCount || 0}</p>
            </div>
            <div className="bg-[#141424] p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400">AI Recommendations</span>
              <p className="text-2xl font-extrabold text-violet-400">{stats?.recommendationsCount || 0}</p>
            </div>
            <div className="bg-[#141424] p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400">Liked Content</span>
              <p className="text-2xl font-extrabold text-rose-400">{stats?.likesCount || 0}</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 bg-violet-950/20 p-2.5 rounded-lg border border-violet-500/20">
            🔒 <strong>Isolated Data Storage:</strong> Your interaction logs are strictly private and isolated to your user ID.
          </p>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
        <h3 className="text-base font-bold text-white border-b border-white/10 pb-3">
          Edit Profile Information
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#141424] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 bg-[#141424]/50 border border-white/5 rounded-xl text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Academic / Education Level
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#141424] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
              >
                <option value="High School">High School</option>
                <option value="Undergraduate">Undergraduate (CS / Tech)</option>
                <option value="Postgraduate">Postgraduate (MS / PhD)</option>
                <option value="Self-Taught Developer">Self-Taught Developer</option>
                <option value="Bootcamp Graduate">Bootcamp Graduate</option>
                <option value="Working Professional">Working Professional</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Primary Goal
              </label>
              <input
                type="text"
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                placeholder="e.g. Master Backend Systems & Crack Interviews"
                className="w-full px-4 py-2.5 bg-[#141424] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Bio / Interests Summary
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about what you enjoy learning or building..."
              className="w-full px-4 py-2.5 bg-[#141424] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
