import User from '../models/User.js';
import Itinerary from '../models/Itinerary.js';
import RateLimitUsage from '../models/RateLimitUsage.js';
import { getCurrentWindowStarts, getLimitSettings } from '../middleware/rateLimiter.js';

// GET /api/admin/users
export const listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// GET /api/admin/users/:id
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const itineraries = await Itinerary.find({ user: user._id }).sort({ createdAt: -1 });
    return res.json({ user, itineraries });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch user details', error: err.message });
  }
};

// PATCH /api/admin/users/:id/role
export const updateUserRole = async (req, res) => {
  const { role } = req.body;

  if (!role || !['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    await user.save();

    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update user role', error: err.message });
  }
};

// GET /api/admin/usage/global
export const getGlobalUsage = async (req, res) => {
  try {
    const { minuteStart, dayStart } = getCurrentWindowStarts();
    const limits = getLimitSettings();

    const [minuteUsage, dayUsage] = await Promise.all([
      RateLimitUsage.findOne({ scope: 'global', window: 'minute', windowStart: minuteStart }),
      RateLimitUsage.findOne({ scope: 'global', window: 'day', windowStart: dayStart }),
    ]);

    return res.json({
      window: { minuteStart, dayStart },
      limits: {
        global: { rpm: limits.globalRpm, tpm: limits.globalTpm, rpd: limits.globalRpd },
        user: { rpm: limits.userRpm, tpm: limits.userTpm, rpd: limits.userRpd },
      },
      usage: {
        minute: {
          requests: minuteUsage?.requestCount || 0,
          tokens: minuteUsage?.tokenCount || 0,
        },
        day: {
          requests: dayUsage?.requestCount || 0,
          tokens: dayUsage?.tokenCount || 0,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch global usage', error: err.message });
  }
};

// GET /api/admin/usage/users
export const getUserUsage = async (req, res) => {
  try {
    const { minuteStart, dayStart } = getCurrentWindowStarts();

    const [dayUsages, minuteUsages] = await Promise.all([
      RateLimitUsage.find({ scope: 'user', window: 'day', windowStart: dayStart }).populate(
        'user',
        'username email role accountType',
      ),
      RateLimitUsage.find({ scope: 'user', window: 'minute', windowStart: minuteStart }),
    ]);

    const minuteMap = new Map(minuteUsages.map((u) => [String(u.user), u]));

    const users = dayUsages
      .filter((u) => u.user)
      .map((u) => {
        const minuteUsage = minuteMap.get(String(u.user._id));
        return {
          user: u.user,
          minute: {
            requests: minuteUsage?.requestCount || 0,
            tokens: minuteUsage?.tokenCount || 0,
          },
          day: {
            requests: u.requestCount || 0,
            tokens: u.tokenCount || 0,
          },
        };
      })
      .sort((a, b) => b.day.requests - a.day.requests);

    return res.json({ window: { minuteStart, dayStart }, users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch user usage', error: err.message });
  }
};
