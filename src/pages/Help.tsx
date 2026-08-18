import React, { useState } from 'react';
import { HelpCircle, Sparkles, ChevronDown, ChevronUp, Database, Cpu, Brain, Shield } from 'lucide-react';

export const Help: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does TechReel AI infer my technology interests?",
      a: "Unlike superficial keyword taggers that trap you in meme loops, TechReel AI uses an intelligent multi-signal weighted behavioral model. Watching more than 80% of a reel contributes +0.8 signal, saving content provides +1.0 signal, liking gives +0.6, and rewatching adds +0.7, while quick skips deduct -0.5. These interactions are synthesized by Claude into comprehensive software engineering domains such as System Design, DSA, Cloud, or Backend Architecture."
    },
    {
      q: "Why am I seeing a particular recommendation?",
      a: "Every recommendation displayed in TechReel AI is accompanied by transparent 'Why' evidence connecting your recent behavioral interactions with the recommended tech concept. We also actively filter out sensationalized clickbait and hype to prioritize authentic engineering concepts."
    },
    {
      q: "What is the Signal Scoring Formula?",
      a: "Signal = (Watch Time % × 0.8) + (Saved × 1.0) + (Liked × 0.6) + (Rewatched × 0.7) + (Shared × 0.5) - (Skipped × 0.5). If the total signal exceeds a 0.5 threshold, it reinforces the underlying technology topic affinity."
    },
    {
      q: "How do I reset my interest profile?",
      a: "Navigate to either 'My Interests' or 'Settings' and click 'Reset Profile'. This completely clears your inferred interest scores while keeping your account and saved bookmarks safe."
    },
    {
      q: "Is my personal social media account tracked?",
      a: "No. TechReel AI operates completely in-app with anonymized and sample tech reels. We never require or link to your personal Instagram, TikTok, or YouTube credentials."
    },
    {
      q: "What database architecture is used?",
      a: "TechReel AI is architected with a full MySQL relational schema with 7 normalized tables: users, user_profiles, user_preferences, reels, user_reel_interactions, user_interests, recommendations, recommendation_feedback, and feedback_submissions. It is deployed with a fast, zero-latency JSON persistent storage engine for instant preview and Cloud Run compatibility."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 selection:bg-violet-600 selection:text-white">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center space-x-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>Documentation & Architecture</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          How TechReel AI Works
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Understanding the AI recommendation engine, signal scoring, and student personalization.
        </p>
      </div>

      {/* Signal Weights Table */}
      <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-6 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 text-cyan-400">
          <Cpu className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Interaction Signal Scoring Matrix</h3>
        </div>
        <p className="text-xs text-slate-400">
          The table below illustrates how your Reel interactions are weighted to determine interest confidence:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-white/10 rounded-xl overflow-hidden">
            <thead className="bg-[#141424] text-slate-300 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">User Action</th>
                <th className="p-3">Weight Factor</th>
                <th className="p-3">Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              <tr className="bg-[#0E0E17]">
                <td className="p-3 font-semibold text-emerald-400">Saved Reel</td>
                <td className="p-3 font-bold">+1.0</td>
                <td className="p-3 text-slate-400">Highest intent to revisit and study deep concept</td>
              </tr>
              <tr className="bg-[#141424]/40">
                <td className="p-3 font-semibold text-violet-400">Full Watch Time (&gt;80%)</td>
                <td className="p-3 font-bold">+0.8</td>
                <td className="p-3 text-slate-400">Strong retention and engagement with the subject</td>
              </tr>
              <tr className="bg-[#0E0E17]">
                <td className="p-3 font-semibold text-cyan-400">Rewatched Content</td>
                <td className="p-3 font-bold">+0.7</td>
                <td className="p-3 text-slate-400">Repeated focus on specific explanation or code</td>
              </tr>
              <tr className="bg-[#141424]/40">
                <td className="p-3 font-semibold text-rose-400">Liked Reel</td>
                <td className="p-3 font-bold">+0.6</td>
                <td className="p-3 text-slate-400">Positive sentiment for the creator or topic</td>
              </tr>
              <tr className="bg-[#0E0E17]">
                <td className="p-3 font-semibold text-amber-400">Skipped (&lt;25% watched)</td>
                <td className="p-3 font-bold">-0.5</td>
                <td className="p-3 text-slate-400">Negative signal; reduces topic prominence</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white">Frequently Asked Questions</h3>

        {faqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div
              key={idx}
              className="bg-[#0E0E17] rounded-2xl border border-white/10 overflow-hidden shadow-md"
            >
              <button
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <span className="text-sm font-semibold text-white">{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-violet-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-white/5 bg-[#141424]/50">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
