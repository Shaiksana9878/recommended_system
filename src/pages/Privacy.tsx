import React from 'react';
import { Shield, Lock, EyeOff, Database } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 selection:bg-violet-600 selection:text-white">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center space-x-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>Student Privacy First</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Privacy Policy & Data Ethics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          How TechReel AI safeguards your learning profile, interaction data, and anonymity.
        </p>
      </div>

      <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl text-xs sm:text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>1. Zero External Social Media Tracking</span>
          </h3>
          <p>
            TechReel AI does not link with or scrape your external TikTok, Instagram, or YouTube accounts. All behavioral analytics (watch %, likes, and saves) occur strictly within our isolated sandbox app.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <EyeOff className="w-4 h-4 text-violet-400" />
            <span>2. Purpose of Behavioral Inferences</span>
          </h3>
          <p>
            Interaction signals are processed purely to generate constructive, high-quality technology learning recommendations and bypass clickbait echo chambers. We never monetize or sell your data to third-party ad brokers.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>3. Right to Forget and Reset</span>
          </h3>
          <p>
            You maintain 100% control over your AI interest profile. You can reset your interest vector anytime via 'My Interests' or permanently delete your student account and all stored history with a single click.
          </p>
        </section>
      </div>
    </div>
  );
};
