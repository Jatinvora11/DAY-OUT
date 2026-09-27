import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import generateToken from '../utils/token.js';

/** Format user object for API responses (no password). */
const formatUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  accountType: user.accountType,
  token: generateToken(user._id),
});

// POST /api/auth/register
export const register = async (req, res) => {
  const { username, email, password, role, adminCode } = req.body;

  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    if (role === 'admin') {
      if (!process.env.ADMIN_REGISTER_CODE) {
        return res.status(500).json({ message: 'Admin registration is not configured' });
      }
      if (!adminCode || adminCode !== process.env.ADMIN_REGISTER_CODE) {
        return res.status(403).json({ message: 'Invalid admin registration code' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    return res.status(201).json(formatUser(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: 'User does not have the selected role' });
    }

    return res.json(formatUser(user));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
