import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_token_key_change_in_production_998877';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication token is missing. Please log in to continue.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Invalid authorization format.',
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
    };

    const user = db.findUserById(decoded.id);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User session not found or account was deleted.',
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    };

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
      return;
    }
    res.status(401).json({
      success: false,
      message: 'Invalid or malformed authentication token.',
    });
  }
}
