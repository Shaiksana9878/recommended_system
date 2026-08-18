import { Response } from 'express';
import { db } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { aiService } from '../services/aiService';

export async function getRecommendations(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const recs = db.getRecommendations(req.user.id, 50);
    const enhanced = recs.map(r => ({
      ...r,
      feedback: db.getFeedback(req.user!.id, r.id) || null,
    }));

    res.json({
      success: true,
      data: enhanced,
      total: enhanced.length,
    });
  } catch (err: any) {
    console.error('getRecommendations error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve recommendations.' });
  }
}

export async function generateRecommendation(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { current_reel_id } = req.body;
    let reelId = current_reel_id ? parseInt(current_reel_id, 10) : null;
    let reelTitle: string | undefined = undefined;

    if (reelId) {
      const currentReel = db.getReelById(reelId);
      reelTitle = currentReel?.title;
    }

    // Call AI inference engine
    const aiResult = await aiService.analyzeInteractionsAndRecommend(req.user.id, reelId);

    // Update interest profile with latest findings
    db.updateInterestProfile(req.user.id, {
      primary_interests: aiResult.primaryInterests,
      secondary_interests: aiResult.secondaryInterests,
      overall_confidence: aiResult.overallConfidence,
      raw_analysis_summary: aiResult.whyDetected,
    });

    // Create persistent recommendation record
    const recommendation = db.createRecommendation(req.user.id, {
      current_reel_id: reelId,
      current_reel_title: reelTitle || (reelId ? `Reel #${reelId}` : 'Recent Scroll Stream'),
      detected_interest: aiResult.detectedInterest,
      why_detected: aiResult.whyDetected,
      recommended_title: aiResult.recommendedTitle,
      recommended_description: aiResult.recommendedDescription,
      category: aiResult.category,
      difficulty: aiResult.difficulty,
      confidence: aiResult.confidence,
      why_recommendation: aiResult.whyRecommendation,
      educational_value: aiResult.educationalValue,
      hype_filtered: aiResult.hypeFiltered,
    });

    res.status(201).json({
      success: true,
      message: 'Personalized technology recommendation generated successfully.',
      data: {
        ...recommendation,
        feedback: null,
        primaryInterests: aiResult.primaryInterests,
      },
    });
  } catch (err: any) {
    console.error('generateRecommendation error:', err);
    res.status(500).json({
      success: false,
      message: 'AI recommendations are temporarily unavailable. Your activity is still being saved.',
    });
  }
}

export async function recordFeedback(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const recommendationId = req.params.id;
    const recommendation = db.getRecommendationById(recommendationId, req.user.id);
    if (!recommendation) {
      res.status(404).json({ success: false, message: 'Recommendation not found.' });
      return;
    }

    const { is_useful, feedback_reason, comments } = req.body;

    const feedback = db.recordFeedback(
      req.user.id,
      recommendationId,
      typeof is_useful === 'boolean' ? is_useful : null,
      feedback_reason,
      comments
    );

    let feedbackMessage = 'Thank you for your feedback! Your recommendation model has been tuned.';
    if (feedback_reason === 'Not Interested') {
      feedbackMessage = "Got it. We'll show you less content like this.";
    }

    res.json({
      success: true,
      message: feedbackMessage,
      data: feedback,
    });
  } catch (err: any) {
    console.error('recordFeedback error:', err);
    res.status(500).json({ success: false, message: 'Failed to record feedback.' });
  }
}
