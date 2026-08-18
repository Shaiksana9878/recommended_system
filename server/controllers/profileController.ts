import { Response } from 'express';
import { db } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const user = db.findUserById(req.user.id);
    const profile = db.getProfile(req.user.id);
    const preferences = db.getPreferences(req.user.id);
    const interactions = db.getInteractionsByUser(req.user.id);
    const saved = db.getSavedReels(req.user.id);
    const recommendations = db.getRecommendations(req.user.id, 100);

    res.json({
      success: true,
      data: {
        user: {
          id: user?.id,
          email: user?.email,
          full_name: user?.full_name,
          role: user?.role,
          created_at: user?.created_at,
        },
        profile,
        preferences,
        stats: {
          totalInteractions: interactions.length,
          savedCount: saved.length,
          recommendationsCount: recommendations.length,
          likesCount: interactions.filter(i => i.liked).length,
        },
      },
    });
  } catch (err: any) {
    console.error('getProfile error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile data.' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { full_name, bio, avatar_url, education_level, primary_goal, onboarding_completed } = req.body;

    if (full_name && typeof full_name === 'string' && full_name.trim().length > 0) {
      db.updateUser(req.user.id, { full_name: full_name.trim() });
    }

    const updatedProfile = db.updateProfile(req.user.id, {
      bio: typeof bio === 'string' ? bio : undefined,
      avatar_url: typeof avatar_url === 'string' ? avatar_url : undefined,
      education_level: typeof education_level === 'string' ? education_level : undefined,
      primary_goal: typeof primary_goal === 'string' ? primary_goal : undefined,
      onboarding_completed: typeof onboarding_completed === 'boolean' ? onboarding_completed : undefined,
    });

    const user = db.findUserById(req.user.id);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        user: {
          id: user?.id,
          email: user?.email,
          full_name: user?.full_name,
          role: user?.role,
          created_at: user?.created_at,
        },
        profile: updatedProfile,
      },
    });
  } catch (err: any) {
    console.error('updateProfile error:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

export async function getPreferences(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const prefs = db.getPreferences(req.user.id);
    res.json({ success: true, data: prefs });
  } catch (err: any) {
    console.error('getPreferences error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve preferences.' });
  }
}

export async function updatePreferences(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const {
      recommendation_style,
      difficulty_preference,
      personalization_enabled,
      selected_initial_topics,
    } = req.body;

    const updated = db.updatePreferences(req.user.id, {
      recommendation_style: ['technical', 'educational', 'career', 'mixed'].includes(recommendation_style)
        ? recommendation_style
        : undefined,
      difficulty_preference: ['beginner', 'intermediate', 'advanced', 'adaptive'].includes(difficulty_preference)
        ? difficulty_preference
        : undefined,
      personalization_enabled: typeof personalization_enabled === 'boolean'
        ? personalization_enabled
        : undefined,
      selected_initial_topics: Array.isArray(selected_initial_topics)
        ? selected_initial_topics
        : undefined,
    });

    res.json({
      success: true,
      message: 'Preferences saved successfully.',
      data: updated,
    });
  } catch (err: any) {
    console.error('updatePreferences error:', err);
    res.status(500).json({ success: false, message: 'Failed to update preferences.' });
  }
}

export async function getSavedReels(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const savedReels = db.getSavedReels(req.user.id);
    res.json({
      success: true,
      data: savedReels,
      total: savedReels.length,
    });
  } catch (err: any) {
    console.error('getSavedReels error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve saved reels.' });
  }
}

export async function saveReel(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const reelId = parseInt(req.params.reelId, 10);
    if (isNaN(reelId)) {
      res.status(400).json({ success: false, message: 'Invalid reel ID.' });
      return;
    }

    const reel = db.getReelById(reelId);
    if (!reel) {
      res.status(404).json({ success: false, message: 'Reel not found.' });
      return;
    }

    db.saveReel(req.user.id, reelId);

    res.json({
      success: true,
      message: 'Reel saved to your collection.',
      data: { reelId, isSaved: true },
    });
  } catch (err: any) {
    console.error('saveReel error:', err);
    res.status(500).json({ success: false, message: 'Failed to save reel.' });
  }
}

export async function unsaveReel(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const reelId = parseInt(req.params.reelId, 10);
    if (isNaN(reelId)) {
      res.status(400).json({ success: false, message: 'Invalid reel ID.' });
      return;
    }

    db.unsaveReel(req.user.id, reelId);

    res.json({
      success: true,
      message: 'Reel removed from saved collection.',
      data: { reelId, isSaved: false },
    });
  } catch (err: any) {
    console.error('unsaveReel error:', err);
    res.status(500).json({ success: false, message: 'Failed to unsave reel.' });
  }
}

export async function deleteAccount(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const deleted = db.deleteUser(req.user.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Your account and all associated data have been permanently deleted.',
    });
  } catch (err: any) {
    console.error('deleteAccount error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete account.' });
  }
}

export async function submitSupportFeedback(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const { feedback_type, message } = req.body;
    if (!message || message.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Please provide a feedback message.' });
      return;
    }

    const validTypes = ['Bug', 'Bad Recommendation', 'Incorrect Interest', 'Content Problem', 'General Feedback'];
    const type = validTypes.includes(feedback_type) ? feedback_type : 'General Feedback';

    const feedback = db.createSupportFeedback(req.user.id, type as any, message.trim());

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Our engineering team has received it.',
      data: feedback,
    });
  } catch (err: any) {
    console.error('submitSupportFeedback error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit feedback.' });
  }
}

export async function exportSchemaSQL(req: any, res: Response): Promise<void> {
  try {
    const sql = db.getMySQLSchemaSQL();
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="schema.sql"');
    res.send(sql);
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to generate MySQL schema.' });
  }
}
