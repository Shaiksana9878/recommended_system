import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { feedbackAPI } from '../services/api';

export const Feedback: React.FC = () => {
  const [feedbackType, setFeedbackType] = useState('General Feedback');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please provide feedback comments.');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      await feedbackAPI.submit({
        feedback_type: feedbackType,
        message: message.trim(),
        rating,
      });
      setSuccess(true);
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 selection:bg-violet-600 selection:text-white">
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center space-x-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span>Student Feedback</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Help Us Improve TechReel AI
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Report inaccuracies, unexpected inferences, or suggest new technical curriculum topics.
        </p>
      </div>

      <div className="bg-[#0E0E17] rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Thank You for Your Feedback!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your submission has been recorded in the database to help tune our AI recommendation algorithms.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-500"
            >
              Submit Another Response
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Feedback Category
              </label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#141424] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
              >
                <option value="General Feedback">General Feedback & Ideas</option>
                <option value="Inaccurate Recommendation">Inaccurate / Off-target Recommendation</option>
                <option value="Incorrect Inferred Interest">Incorrect Inferred Interest Profile</option>
                <option value="Hype / Clickbait Detected">Hype / Clickbait Content Problem</option>
                <option value="Bug Report">Technical Bug Report</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Overall AI Accuracy Rating ({rating} / 5)
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm border transition-all ${
                      rating >= star
                        ? 'bg-violet-600/30 text-violet-300 border-violet-500'
                        : 'bg-[#141424] text-slate-500 border-white/5'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Your Comments & Suggestions
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe what happened or what tech reels you'd love to see next..."
                className="w-full px-4 py-2.5 bg-[#141424] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25 flex items-center space-x-2 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Feedback'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
