import express from 'express';
import { body } from 'express-validator';
import { protect, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { submitMessage, getMessages } from '../controllers/contactController.js';

const router = express.Router();

const messageRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
];

router.post('/', messageRules, validate, submitMessage);
router.get('/', protect, requireAdmin, getMessages);

export default router;
