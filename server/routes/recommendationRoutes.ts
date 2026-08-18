import { Router } from 'express';
import { getRecommendations, generateRecommendation, recordFeedback } from '../controllers/recommendationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getRecommendations);
router.post('/generate', authMiddleware, generateRecommendation);
router.post('/:id/feedback', authMiddleware, recordFeedback);

export default router;
