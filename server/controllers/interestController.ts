import { Response } from 'express';
import { db } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { aiService } from '../services/aiService';

export async function getInterestProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const profile = db.getInterestProfile(req.user.id);
    const interactions = db.getInteractionsByUser(req.user.id);

    res.json({
      success: true,
      data: {
        ...profile,
        totalInteractions: interactions.length,
        totalLikes: interactions.filter(i => i.liked).length,
        totalSaved: interactions.filter(i => i.saved).length,
      },
    });
  } catch (err: any) {
    console.error('getInterestProfile error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve interest profile.' });
  }
}

export async function analyzeInteractions(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { current_reel_id } = req.body;
    const aiResult = await aiService.analyzeInteractionsAndRecommend(
      req.user.id,
      current_reel_id ? parseInt(current_reel_id, 10) : null
    );

    // Persist updated interest profile
    const updatedProfile = db.updateInterestProfile(req.user.id, {
      primary_interests: aiResult.primaryInterests,
      secondary_interests: aiResult.secondaryInterests,
      overall_confidence: aiResult.overallConfidence,
      raw_analysis_summary: aiResult.whyDetected,
    });

    res.json({
      success: true,
      message: 'AI interest analysis completed successfully.',
      data: {
        interestProfile: updatedProfile,
        analysisResult: aiResult,
      },
    });
  } catch (err: any) {
    console.error('analyzeInteractions error:', err);
    res.status(500).json({ success: false, message: 'Failed to complete AI interest inference.' });
  }
}

export async function resetInterestProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const resetProfile = db.resetInterestProfile(req.user.id);

    res.json({
      success: true,
      message: 'Your inferred interest profile has been reset. Fresh interactions will build a new profile.',
      data: resetProfile,
    });
  } catch (err: any) {
    console.error('resetInterestProfile error:', err);
    res.status(500).json({ success: false, message: 'Failed to reset interest profile.' });
  }
}
