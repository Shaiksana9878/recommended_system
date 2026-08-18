import { Router, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getReels, getReelById, recordInteraction } from '../controllers/reelController';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { db } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_token_key_change_in_production_998877';

// Optional auth helper: if token exists, populate req.user, but don't reject if missing
function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
      const user = db.findUserById(decoded.id);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        };
      }
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}

const router = Router();

router.get('/', optionalAuth, getReels);
router.get('/:id', optionalAuth, getReelById);
router.post('/:id/interactions', authMiddleware, recordInteraction);

export default router;
