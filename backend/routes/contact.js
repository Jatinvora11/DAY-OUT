import express from 'express';
import { body, validationResult } from 'express-validator';
import ContactMessage from '../models/ContactMessage.js';

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit contact message
// @access  Public
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('message').trim().notEmpty().withMessage('Message is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    try {
      const contactMessage = await ContactMessage.create({
        name,
        email,
        message
      });

      res.status(201).json({
        message: 'Message sent successfully',
        data: contactMessage
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
  }
);

// @route   GET /api/contact
// @desc    Get all contact messages (admin only - you can add admin middleware later)
// @access  Public (should be protected with admin middleware)
router.get('/', async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
});

export default router;
