import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';

const router = express.Router();

const LOCK_TIME_MS = 15 * 60 * 1000;
const MAX_FAILED_LOGIN_ATTEMPTS = 5;

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later' }
});

// Generate short-lived access token
const generateAccessToken = (id) => {
  return jwt.sign({ id, type: 'access' }, process.env.JWT_SECRET, {
    expiresIn: '15m'
  });
};

// Generate long-lived refresh token
const generateRefreshToken = (id) => {
  return jwt.sign({ id, type: 'refresh' }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
});

const sendAuthResponse = (res, statusCode, user) => {
  const refreshToken = generateRefreshToken(user._id);

  res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());
  return res.status(statusCode).json({
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    accountType: user.accountType,
    token: generateAccessToken(user._id)
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  authLimiter,
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role, adminCode } = req.body;

    try {
      // Check if user already exists
      const userExists = await User.findOne({ $or: [{ email }, { username }] });

      if (userExists) {
        return res.status(400).json({ message: 'User already exists with this email or username' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      if (role === 'admin') {
        if (!process.env.ADMIN_REGISTER_CODE) {
          return res.status(500).json({ message: 'Admin registration is not configured' });
        }

        if (!adminCode || adminCode !== process.env.ADMIN_REGISTER_CODE) {
          return res.status(403).json({ message: 'Invalid admin registration code' });
        }
      }

      // Create user
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        role: role || 'user'
      });

      if (user) {
        return sendAuthResponse(res, 201, user);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  authLimiter,
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, role } = req.body;

    try {
      // Find user by username
      const user = await User.findOne({ username });

      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      if (user.lockUntil && user.lockUntil > new Date()) {
        return res.status(423).json({ message: 'Account is temporarily locked. Please try again later.' });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        user.failedLoginAttempts += 1;

        if (user.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
          user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
        }

        await user.save();
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      if (role && user.role !== role) {
        return res.status(403).json({ message: 'User does not have the selected role' });
      }

      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();

      return sendAuthResponse(res, 200, user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Refresh token invalid' });
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    return res.json({
      token: generateAccessToken(user._id)
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Refresh token invalid' });
  }
});

// @route   POST /api/auth/logout
// @desc    Clear refresh token cookie
// @access  Public
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', getRefreshCookieOptions());
  res.json({ message: 'Logged out successfully' });
});

export default router;
