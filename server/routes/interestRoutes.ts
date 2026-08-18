import { Router } from 'express';
import { getInterestProfile, analyzeInteractions, resetInterestProfile } from '../controllers/interestController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getInterestProfile);
router.post('/analyze', authMiddleware, analyzeInteractions);
router.post('/reset', authMiddleware, resetInterestProfile);

export default router;
