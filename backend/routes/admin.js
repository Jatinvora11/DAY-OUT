import express from 'express';
import { protect, requireAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import Itinerary from '../models/Itinerary.js';
import RateLimitUsage from '../models/RateLimitUsage.js';
import { getCurrentWindowStarts, getLimitSettings } from '../middleware/rateLimiter.js';

const router = express.Router();

// @route   GET /api/admin/users
// @desc    List all users (admin only)
// @access  Private/Admin
router.get('/users', protect, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user details and itineraries (admin only)
// @access  Private/Admin
router.get('/users/:id', protect, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const itineraries = await Itinerary.find({ user: user._id }).sort({ createdAt: -1 });

    res.json({
      user,
      itineraries
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch user details', error: error.message });
  }
});

// @route   PATCH /api/admin/users/:id/role
// @desc    Update a user's role (admin only)
// @access  Private/Admin
router.patch('/users/:id/role', protect, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update user role', error: error.message });
  }
});

// @route   GET /api/admin/usage/global
// @desc    Get global usage for current windows (admin only)
// @access  Private/Admin
router.get('/usage/global', protect, requireAdmin, async (req, res) => {
  try {
    const { minuteStart, dayStart } = getCurrentWindowStarts();
    const limits = getLimitSettings();

    const [minuteUsage, dayUsage] = await Promise.all([
      RateLimitUsage.findOne({ scope: 'global', window: 'minute', windowStart: minuteStart }),
      RateLimitUsage.findOne({ scope: 'global', window: 'day', windowStart: dayStart })
    ]);

    res.json({
      window: {
        minuteStart,
        dayStart
      },
      limits: {
        global: {
          rpm: limits.globalRpm,
          tpm: limits.globalTpm,
          rpd: limits.globalRpd
        },
        user: {
          rpm: limits.userRpm,
          tpm: limits.userTpm,
          rpd: limits.userRpd
        }
      },
      usage: {
        minute: {
          requests: minuteUsage?.requestCount || 0,
          tokens: minuteUsage?.tokenCount || 0
        },
        day: {
          requests: dayUsage?.requestCount || 0,
          tokens: dayUsage?.tokenCount || 0
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch global usage', error: error.message });
  }
});

// @route   GET /api/admin/usage/users
// @desc    Get per-user usage for current windows (admin only)
// @access  Private/Admin
router.get('/usage/users', protect, requireAdmin, async (req, res) => {
  try {
    const { minuteStart, dayStart } = getCurrentWindowStarts();

    const [dayUsages, minuteUsages] = await Promise.all([
      RateLimitUsage.find({ scope: 'user', window: 'day', windowStart: dayStart }).populate('user', 'username email role accountType'),
      RateLimitUsage.find({ scope: 'user', window: 'minute', windowStart: minuteStart })
    ]);

    const minuteMap = new Map();
    minuteUsages.forEach((usage) => {
      minuteMap.set(String(usage.user), usage);
    });

    const response = dayUsages
      .filter((usage) => usage.user)
      .map((usage) => {
        const minuteUsage = minuteMap.get(String(usage.user._id));
        return {
          user: usage.user,
          minute: {
            requests: minuteUsage?.requestCount || 0,
            tokens: minuteUsage?.tokenCount || 0
          },
          day: {
            requests: usage.requestCount || 0,
            tokens: usage.tokenCount || 0
          }
        };
      })
      .sort((a, b) => b.day.requests - a.day.requests);

    res.json({
      window: {
        minuteStart,
        dayStart
      },
      users: response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch user usage', error: error.message });
  }
});

export default router;
