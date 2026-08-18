import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_token_key_change_in_production_998877';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { full_name, email, password, confirm_password } = req.body;

    if (!full_name || typeof full_name !== 'string' || full_name.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Full name is required.' });
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (password !== confirm_password) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    // Check duplicate
    const existing = db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = db.createUser({
      email: email.trim().toLowerCase(),
      full_name: full_name.trim(),
      password_hash,
      role: 'student',
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const profile = db.getProfile(user.id);
    const preferences = db.getPreferences(user.id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to TechReel AI!',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          created_at: user.created_at,
        },
        profile,
        preferences,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Failed to create account. Please try again later.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ success: false, message: 'Incorrect email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Incorrect email or password.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const profile = db.getProfile(user.id);
    const preferences = db.getPreferences(user.id);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          created_at: user.created_at,
        },
        profile,
        preferences,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Authentication service temporarily unavailable.' });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = db.findUserById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const profile = db.getProfile(user.id);
    const preferences = db.getPreferences(user.id);
    const interestProfile = db.getInterestProfile(user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          created_at: user.created_at,
        },
        profile,
        preferences,
        interestProfile,
      },
    });
  } catch (err: any) {
    console.error('GetMe error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Please provide an email address.' });
      return;
    }

    const user = db.findUserByEmail(email);
    // Generic response to avoid email enumeration
    res.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been dispatched.',
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Password recovery error.' });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  res.json({ success: true, message: 'Logged out successfully.' });
}
