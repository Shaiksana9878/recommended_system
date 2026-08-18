import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  Brain,
  ShieldCheck,
  Compass,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle2,
  XCircle,
  PlayCircle,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Landing: React.FC = () => {
  const { user } = useAuth();
  const [selectedDemoScenario, setSelectedDemoScenario] = useState<number>(0);

  const scenarios = [
    {
      title: "Student Scrolling Pattern",
      inputs: [
        "Java programming meme (95% watched, Liked)",
        "Software engineer lifestyle (100% watched, Saved)",
        "Coding interview joke (90% watched, Rewatched)",
        "Developer laptop comparison (85% watched, Liked)"
      ],
      naive: {
        inferred: "Java / Memes",
        recommendation: "Another Java Meme Compilation 😂",
        flaw: "Keyword echo chamber. Ignores career intent and engineering context."
      },
      techreel: {
        inferred: "Software Engineering & Systems",
        confidence: "High",
        recommendation: "How Backend Systems Work: API → Server → Database",
        category: "System Design",
        why: "Connects programming, interview, and workstation interest into foundational backend architecture."
      }
    },
    {
      title: "AI & Tech Curiosity Pattern",
      inputs: [
        "How ChatGPT Works (100% watched, Saved)",
        "Neural Network basics (85% watched, Liked)",
        "Skipped '10 AI Tools to Make $10k/mo' (Skipped at 10%)"
      ],
      naive: {
        inferred: "AI / Money / Tools",
        recommendation: "Top 10 Secret AI Tools That Guarantee Wealth! 🚀",
        flaw: "Promotes sensationalized clickbait hype."
      },
      techreel: {
        inferred: "Artificial Intelligence & LLMs",
        confidence: "High",
        recommendation: "How RAG (Retrieval-Augmented Generation) Actually Works",
        category: "AI Architecture",
        why: "Filters out hype and delivers authentic vector search & enterprise generative AI fundamentals."
      }
    }
  ];

  const currentScenario = scenarios[selectedDemoScenario];

  return (
    <div className="min-h-screen bg-[#06060A] text-slate-100 flex flex-col selection:bg-violet-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-white/5">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-600/15 via-cyan-500/10 to-transparent blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#141424] border border-violet-500/30 text-xs font-semibold text-violet-300 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Recommendation Agent for Students</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Turn Your Scroll Into <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Something Useful.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 leading-relaxed">
            AI that understands what you're genuinely interested in from casual scrolling, infers deeper technology concepts, and recommends content worth watching.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-xl shadow-violet-600/25 flex items-center justify-center space-x-2 transition-all duration-200"
            >
              <span>{user ? "Open Dashboard" : "Get Started Free"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/help"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-[#141424] text-slate-200 hover:text-white border border-white/10 hover:border-violet-500/30 flex items-center justify-center space-x-2 transition-all duration-200"
            >
              <span>See How It Works</span>
            </Link>
          </div>

          {/* Quick Demo Credentials Reminder */}
          {!user && (
            <p className="text-xs text-slate-400 pt-2">
              Ready to test instantly? Sign up in 10 seconds or explore the live demo.
            </p>
          )}
        </div>
      </section>

      {/* Interactive Comparison Demo Section */}
      <section className="py-16 sm:py-24 bg-[#0A0A12] border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              Live AI Inference vs Keyword Matching
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Why Keyword Matchers Fail & How TechReel AI Learns
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Select a scrolling pattern below to see how our AI recommendation agent uncovers deeper technology intent instead of trapping you in shallow meme loops.
            </p>

            {/* Scenario switcher pills */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {scenarios.map((sc, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDemoScenario(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedDemoScenario === idx
                      ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-600/20'
                      : 'bg-[#141424] text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  Scenario {idx + 1}: {sc.title}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
            {/* Input Behaviors */}
            <div className="lg:col-span-4 bg-[#0E0E17] rounded-2xl border border-white/10 p-5 space-y-4">
              <div className="flex items-center space-x-2 text-violet-400 font-semibold text-xs uppercase tracking-wider">
                <PlayCircle className="w-4 h-4 text-cyan-400" />
                <span>Observed Reel Scroll Signals</span>
              </div>
              <ul className="space-y-2.5">
                {currentScenario.inputs.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-200 bg-[#141424] p-3 rounded-xl border border-white/5 flex items-start space-x-2"
                  >
                    <span className="text-violet-400 font-bold shrink-0 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/20 text-[11px] text-slate-300">
                💡 <strong>Signal Analysis:</strong> Evaluates watch %, saves, likes, shares, and skip rates with weighted behavioral vectors.
              </div>
            </div>

            {/* Traditional Search / Naive Result */}
            <div className="lg:col-span-4 bg-[#0E0E17] rounded-2xl border border-rose-500/20 p-5 space-y-4 relative opacity-85">
              <div className="flex items-center justify-between text-rose-400 font-semibold text-xs uppercase tracking-wider">
                <div className="flex items-center space-x-1.5">
                  <XCircle className="w-4 h-4" />
                  <span>Weak / Keyword Matcher</span>
                </div>
                <span className="text-[10px] bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  Superficial
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Inferred Topic:</span>
                <p className="text-sm font-semibold text-white bg-slate-900/60 p-2 rounded-lg">
                  {currentScenario.naive.inferred}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Suggested Next Reel:</span>
                <p className="text-xs font-semibold text-rose-300 bg-rose-950/20 border border-rose-500/20 p-2.5 rounded-lg">
                  {currentScenario.naive.recommendation}
                </p>
              </div>

              <div className="text-[11px] text-rose-300/80 bg-rose-950/10 p-2.5 rounded-lg border border-rose-500/10">
                ❌ <strong>Defect:</strong> {currentScenario.naive.flaw}
              </div>
            </div>

            {/* TechReel AI Result */}
            <div className="lg:col-span-4 bg-[#0E0E17] rounded-2xl border border-violet-500/40 p-5 space-y-4 shadow-2xl relative">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-violet-500 to-cyan-400" />
              <div className="flex items-center justify-between text-cyan-400 font-semibold text-xs uppercase tracking-wider">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span>TechReel AI Agent</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                  High Confidence
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Underlying Interest:</span>
                <p className="text-sm font-bold text-white bg-violet-950/30 border border-violet-500/20 p-2 rounded-lg">
                  {currentScenario.techreel.inferred}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-cyan-400">Curated Recommendation:</span>
                <p className="text-xs font-bold text-white bg-cyan-950/30 border border-cyan-500/30 p-2.5 rounded-lg">
                  {currentScenario.techreel.recommendation}
                </p>
              </div>

              <div className="text-[11px] text-slate-300 bg-[#141424] p-2.5 rounded-lg border border-white/5">
                ✅ <strong>Why This Works:</strong> {currentScenario.techreel.why}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            How TechReel AI Changes The Way You Scroll
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Designed for students to bridge the gap between entertaining social reels and real software engineering growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-6 space-y-3 hover:border-violet-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Brain className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="text-base font-bold text-white">Understand Your Interests</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI analyzes behavioral weights (saves, rewatches, watch completion) to infer broad technology domains beyond superficial titles.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-6 space-y-3 hover:border-cyan-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
              <Compass className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-base font-bold text-white">Discover Better Content</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect casual jokes and dev memes to system design, data structures, networking protocols, and backend fundamentals.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-6 space-y-3 hover:border-emerald-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-white">Hype-Free Learning</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero clickbait. High penalties for "Make $10k in 7 days" and strict boosts for verified engineering concepts and problem-solving.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-6 space-y-3 hover:border-amber-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-white">Personalized Over Time</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your interest profile continuously adapts without erasing your progress after one interaction. Reset or tune it anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Call to action footer banner */}
      <section className="mt-auto border-t border-white/10 bg-[#0A0A12] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to upgrade your technology feed?
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
            Create an account in seconds, explore anonymized tech reels, and watch our AI agent infer your true learning potential.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl font-bold text-sm bg-violet-600 text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/25"
            >
              Create Account
            </Link>
            <Link
              to="/explore"
              className="px-6 py-3 rounded-xl font-bold text-sm bg-[#141424] text-slate-300 hover:text-white border border-white/10 transition-colors"
            >
              Explore Sample Reels
            </Link>
          </div>
          <div className="pt-6 text-xs text-slate-400 flex items-center justify-center space-x-6">
            <span>© 2026 TechReel AI</span>
            <Link to="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <Link to="/help" className="hover:text-slate-300">Architecture FAQ</Link>
          </div>
        </div>
      </section>
    </div>
  );
};
