import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Itinerary from '../models/Itinerary.js';

/** Format user object for API responses (no password). */
const formatUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  accountType: user.accountType,
  createdAt: user.createdAt,
});

// GET /api/user/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/user/profile
export const updateProfile = async (req, res) => {
  const { username, email } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (username || email) {
      const conflict = await User.findOne({
        _id: { $ne: req.user._id },
        $or: [
          ...(username ? [{ username }] : []),
          ...(email ? [{ email }] : []),
        ],
      });
      if (conflict) {
        return res.status(400).json({ message: 'Username or email already in use' });
      }
    }

    if (username) user.username = username;
    if (email) user.email = email;

    const updatedUser = await user.save();
    return res.json(formatUser(updatedUser));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/user/change-password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/user
export const deleteAccount = async (req, res) => {
  const { password } = req.body;

  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Password is incorrect' });

    await Itinerary.deleteMany({ user: req.user._id });
    await user.deleteOne();

    return res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
