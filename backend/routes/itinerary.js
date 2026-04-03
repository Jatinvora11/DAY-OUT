import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { checkAndReserveRateLimit, finalizeRateLimitUsage, estimateTokensFromText } from '../middleware/rateLimiter.js';
import Itinerary from '../models/Itinerary.js';

const router = express.Router();

// @route   POST /api/itinerary/generate
// @desc    Generate itinerary using Gemini AI
// @access  Private
router.post(
  '/generate',
  [
    protect,
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('startDate').isDate().withMessage('Valid start date is required'),
    body('endDate').isDate().withMessage('Valid end date is required'),
    body('adults').isInt({ min: 1 }).withMessage('At least 1 adult is required'),
    body('children').isInt({ min: 0 }).withMessage('Children count must be 0 or more'),
    body('budget').isInt({ min: 0 }).withMessage('Budget must be 0 or more'),
    body('budgetType').optional().isIn(['overall', 'per_person']).withMessage('Invalid budget type'),
    body('tripType').isIn(['leisure', 'adventure', 'cultural', 'business']).withMessage('Invalid trip type')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { location, startDate, endDate, adults, children, budget, budgetType, tripType, specialRequests } = req.body;

    let reservation = null;
    const budgetLabel = budgetType === 'per_person' ? 'per person' : 'overall';
    const prompt = `Create a detailed itinerary for ${location} from ${startDate} to ${endDate} for ${adults} adults and ${children} children with a ${budgetLabel} budget of ${budget} INR. The trip type is ${tripType}. Special requests: ${specialRequests || 'None'}. Please provide day-by-day activities, recommended places to visit, estimated costs, and travel tips.`;
    const estimatedTokens = estimateTokensFromText(prompt);

    try {
      // Initialize Gemini AI with environment variable (loaded at runtime)
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      
      console.log('🚀 Generating itinerary for:', location);
      console.log('📅 Dates:', startDate, 'to', endDate);
      console.log('👥 Travelers:', adults, 'adults,', children, 'children');
      
      reservation = await checkAndReserveRateLimit({
        userId: req.user._id,
        estimatedTokens
      });

      if (!reservation.allowed) {
        const retryAfterSeconds = reservation.retryAfterSeconds || 0;
        const retryMinutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
        const retryHours = Math.max(1, Math.ceil(retryAfterSeconds / 3600));
        const retryValue = reservation.retryWindow === 'day' ? retryHours : retryMinutes;
        const retryUnit = reservation.retryWindow === 'day' ? 'hours' : 'minutes';

        res.set('Retry-After', retryAfterSeconds.toString());
        return res.status(429).json({
          message: `Rate limit reached. Please try again after ${retryValue} ${retryUnit}.`
        });
      }

      console.log('🤖 Calling Gemini API...');
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const itineraryText = response.text();
      const actualTokens = estimateTokensFromText(prompt) + estimateTokensFromText(itineraryText);
      const tokenDelta = actualTokens - estimatedTokens;

      if (reservation.allowed) {
        await finalizeRateLimitUsage({
          userId: req.user._id,
          minuteStart: reservation.minuteStart,
          dayStart: reservation.dayStart,
          tokenDelta
        });
      }
      
      console.log('✅ Itinerary generated successfully');

      res.json({
        itinerary: itineraryText,
        details: {
          location,
          startDate,
          endDate,
          adults,
          children,
          budget,
          budgetType: budgetType || 'overall',
          tripType,
          specialRequests
        }
      });
    } catch (error) {
      if (reservation?.allowed) {
        await finalizeRateLimitUsage({
          userId: req.user._id,
          minuteStart: reservation.minuteStart,
          dayStart: reservation.dayStart,
          tokenDelta: 0
        });
      }
      console.error('❌ Gemini API Error:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'Failed to generate itinerary', error: error.message });
    }
  }
);

// @route   POST /api/itinerary/save
// @desc    Save itinerary to database
// @access  Private
router.post(
  '/save',
  [
    protect,
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('startDate').isDate().withMessage('Valid start date is required'),
    body('endDate').isDate().withMessage('Valid end date is required'),
    body('adults').isInt({ min: 1 }).withMessage('At least 1 adult is required'),
    body('children').isInt({ min: 0 }).withMessage('Children count must be 0 or more'),
    body('budget').isInt({ min: 0 }).withMessage('Budget must be 0 or more'),
    body('budgetType').optional().isIn(['overall', 'per_person']).withMessage('Invalid budget type'),
    body('itineraryText').trim().notEmpty().withMessage('Itinerary text is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { location, startDate, endDate, adults, children, budget, budgetType, tripType, specialRequests, itineraryText } = req.body;

    try {
      const itinerary = await Itinerary.create({
        user: req.user._id,
        location,
        startDate,
        endDate,
        adults,
        children,
        budget,
        budgetType: budgetType || 'overall',
        tripType,
        specialRequests,
        itineraryText
      });

      res.status(201).json({
        message: 'Itinerary saved successfully',
        itinerary
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to save itinerary', error: error.message });
    }
  }
);

// @route   GET /api/itinerary/user
// @desc    Get all itineraries for logged-in user
// @access  Private
router.get('/user', protect, async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json(itineraries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch itineraries', error: error.message });
  }
});

// @route   GET /api/itinerary/:id
// @desc    Get single itinerary by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Check if itinerary belongs to logged-in user
    if (itinerary.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this itinerary' });
    }

    res.json(itinerary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch itinerary', error: error.message });
  }
});

// @route   DELETE /api/itinerary/:id
// @desc    Delete itinerary
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Check if itinerary belongs to logged-in user
    if (itinerary.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this itinerary' });
    }

    await itinerary.deleteOne();

    res.json({ message: 'Itinerary deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete itinerary', error: error.message });
  }
});

export default router;
