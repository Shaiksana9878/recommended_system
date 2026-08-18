import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  getSavedReels,
  saveReel,
  unsaveReel,
  deleteAccount,
  submitSupportFeedback,
  exportSchemaSQL,
} from '../controllers/profileController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Profile endpoints
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.delete('/profile', authMiddleware, deleteAccount);

// Preferences endpoints
router.get('/preferences', authMiddleware, getPreferences);
router.put('/preferences', authMiddleware, updatePreferences);

// Saved reels endpoints
router.get('/saved', authMiddleware, getSavedReels);
router.post('/saved/:reelId', authMiddleware, saveReel);
router.delete('/saved/:reelId', authMiddleware, unsaveReel);

// Feedback / Support endpoints
router.post('/feedback', authMiddleware, submitSupportFeedback);

// Schema DDL export endpoint
router.get('/schema.sql', exportSchemaSQL);

export default router;
