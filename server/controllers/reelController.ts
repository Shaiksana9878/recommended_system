import { Request, Response } from 'express';
import { db } from '../config/db';
import { AuthRequest } from '../middleware/auth';

export async function getReels(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { q, category, difficulty } = req.query;
    let reels = db.getAllReels();

    // 1. Search Query Filter
    if (q && typeof q === 'string') {
      const queryLower = q.toLowerCase().trim();
      reels = reels.filter(r =>
        r.title.toLowerCase().includes(queryLower) ||
        r.description.toLowerCase().includes(queryLower) ||
        r.category.toLowerCase().includes(queryLower) ||
        r.tags.some(t => t.toLowerCase().includes(queryLower)) ||
        r.creator.toLowerCase().includes(queryLower)
      );
    }

    // 2. Category Filter
    if (category && typeof category === 'string' && category !== 'All') {
      reels = reels.filter(r => r.category.toLowerCase() === category.toLowerCase());
    }

    // 3. Difficulty Filter
    if (difficulty && typeof difficulty === 'string' && difficulty !== 'All') {
      reels = reels.filter(r => r.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    // If authenticated, merge user's saved & interaction state
    const userId = req.user?.id;
    let interactionsMap: Record<number, any> = {};
    let savedIds = new Set<number>();

    if (userId) {
      const interactions = db.getInteractionsByUser(userId);
      interactions.forEach(i => {
        interactionsMap[i.reel_id] = i;
      });
      const savedReels = db.getSavedReels(userId);
      savedReels.forEach(r => savedIds.add(r.id));
    }

    const enhancedReels = reels.map(r => ({
      ...r,
      userInteraction: userId ? (interactionsMap[r.id] || null) : null,
      isSaved: userId ? savedIds.has(r.id) : false,
      isLiked: userId ? !!interactionsMap[r.id]?.liked : false,
    }));

    res.json({
      success: true,
      data: enhancedReels,
      total: enhancedReels.length,
    });
  } catch (err: any) {
    console.error('getReels error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve reels.' });
  }
}

export async function getReelById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid reel ID.' });
      return;
    }

    const reel = db.getReelById(id);
    if (!reel) {
      res.status(404).json({ success: false, message: 'Reel not found.' });
      return;
    }

    const userId = req.user?.id;
    let interaction = null;
    let isSaved = false;

    if (userId) {
      interaction = db.getInteraction(userId, id) || null;
      isSaved = db.isReelSaved(userId, id);
    }

    res.json({
      success: true,
      data: {
        ...reel,
        userInteraction: interaction,
        isSaved,
        isLiked: !!interaction?.liked,
      },
    });
  } catch (err: any) {
    console.error('getReelById error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve reel details.' });
  }
}

export async function recordInteraction(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized.' });
      return;
    }

    const reelId = parseInt(req.params.id, 10);
    if (isNaN(reelId)) {
      res.status(400).json({ success: false, message: 'Invalid reel ID.' });
      return;
    }

    const reel = db.getReelById(reelId);
    if (!reel) {
      res.status(404).json({ success: false, message: 'Reel not found.' });
      return;
    }

    const { watch_percentage, liked, saved, shared, skipped, rewatched } = req.body;

    const interaction = db.recordInteraction(req.user.id, reelId, {
      watch_percentage: typeof watch_percentage === 'number' ? Math.min(100, Math.max(0, watch_percentage)) : undefined,
      liked: typeof liked === 'boolean' ? liked : undefined,
      saved: typeof saved === 'boolean' ? saved : undefined,
      shared: typeof shared === 'boolean' ? shared : undefined,
      skipped: typeof skipped === 'boolean' ? skipped : undefined,
      rewatched: typeof rewatched === 'boolean' ? rewatched : undefined,
    });

    res.json({
      success: true,
      message: 'Interaction recorded successfully.',
      data: interaction,
    });
  } catch (err: any) {
    console.error('recordInteraction error:', err);
    res.status(500).json({ success: false, message: 'Failed to record interaction.' });
  }
}
