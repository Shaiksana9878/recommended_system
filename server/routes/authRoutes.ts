import { Router } from 'express';
import { register, login, logout, getMe, forgotPassword } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);
router.post('/forgot-password', forgotPassword);

export default router;
