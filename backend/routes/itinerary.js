import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { checkAndReserveRateLimit, finalizeRateLimitUsage, estimateTokensFromText } from '../middleware/rateLimiter.js';
import Itinerary from '../models/Itinerary.js';

const router = express.Router();

const normalizeLineEndings = (text) => {
  if (!text) return '';
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    body('travelPace').optional().isIn(['relaxed', 'moderate', 'packed']).withMessage('Invalid travel pace'),
    body('accommodationType')
      .optional()
      .isIn(['hostel', 'hotel', 'resort', 'airbnb'])
      .withMessage('Invalid accommodation type'),
    body('tripStyles').optional().isArray({ max: 2 }).withMessage('Trip styles must be an array of up to 2'),
    body('mustSee').optional().isArray().withMessage('Must-see must be an array')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      location,
      startDate,
      endDate,
      adults,
      children,
      budget,
      budgetType,
      travelPace,
      accommodationType,
      tripStyles,
      mustSee,
      specialRequests,
      tripType
    } = req.body;

    let reservation = null;

    // ── Build structured prompt ──────────────────────────────────────────────
    const budgetLabel = budgetType === 'per_person' ? 'per person' : 'overall';
    const totalDays = Math.max(
      1,
      Math.round(
        (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
      ) + 1
    );
    const paceDescriptions = {
      relaxed: 'a relaxed pace with generous rest time between activities (3-4 activities per day)',
      moderate: 'a moderate pace balancing sightseeing with leisure (4-5 activities per day)',
      packed: 'a packed schedule maximising every hour (6-7 activities per day)'
    };
    const paceDetail = paceDescriptions[travelPace] || paceDescriptions.moderate;
    const stylesText = Array.isArray(tripStyles) && tripStyles.length > 0
      ? tripStyles.join(' and ')
      : tripType || 'general leisure';
    const mustSeeText = Array.isArray(mustSee) && mustSee.length > 0
      ? `You MUST include the following attractions somewhere in the itinerary: ${mustSee.join(', ')}.`
      : '';
    const specialText = specialRequests ? `Special requests: ${specialRequests}.` : '';
    const childrenText = Number(children) > 0
      ? `${children} ${Number(children) === 1 ? 'child' : 'children'} (keep activities family-friendly where appropriate)`
      : 'no children';

    const prompt = `You are an expert travel planner. Create a complete, day-by-day travel itinerary using ONLY the structured format described below. Do NOT add any commentary, preamble, or text outside the tags.

Trip details (use these to inform your plan — do NOT copy them verbatim into the output):
- Destination: ${location}
- Dates: ${startDate} to ${endDate} (${totalDays} day${totalDays > 1 ? 's' : ''})
- Travelers: ${adults} adult${Number(adults) > 1 ? 's' : ''}, ${childrenText}
- Budget: ₹${budget} ${budgetLabel}
- Preferred accommodation: ${accommodationType || 'hotel'}
- Travel style: ${stylesText}
- Pace: ${paceDetail}
${mustSeeText}
${specialText}

OUTPUT FORMAT — follow this EXACTLY:

[DESCRIPTION]
Write 2-3 engaging sentences that set the scene and tone for the trip. Make it inspiring and specific to the destination and travel style. Do NOT mention specific numbers like budget amount, number of adults, or raw preference labels.
[/DESCRIPTION]

For each of the ${totalDays} days, write a block in this format:

[DAY <n> | <YYYY-MM-DD> | <Short evocative theme for the day, 3-6 words>]
HH:MM | <Place or Activity Name> — <One sentence describing what to do or see there>
HH:MM | <Place or Activity Name> — <One sentence describing what to do or see there>
(continue for all activities that day)
[/DAY]

After all days, write:

[TRAVEL_AND_ACCOMMODATION]
- <Tip about getting to the destination (flights, trains, etc.) with realistic options>
- <Tip about local transport at the destination>
- <Specific accommodation recommendation matching the ₹${budget} ${budgetLabel} budget and preferred type (${accommodationType || 'hotel'})>
- <Best area or neighborhood to stay in and why>
- <One additional practical travel tip (best time to visit local attractions, booking advice, local customs, etc.)>
[/TRAVEL_AND_ACCOMMODATION]

IMPORTANT RULES:
1. Use 24-hour HH:MM time format (e.g., 09:00, 13:30, 20:00).
2. Activities must be realistic for the date, local opening hours, and the traveler's pace.
3. Include meal stops (breakfast, lunch, dinner) as activities with a suggested restaurant or food type.
4. Do NOT echo or repeat the raw trip details the user provided.
5. Do NOT add any text, headers, or markdown outside the tags above.
6. Start the very first character with [DESCRIPTION].`;
    // ────────────────────────────────────────────────────────────────────────
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
      const modelsToTry = [
        'gemini-2.5-flash',
        'gemini-flash-latest',
        'gemini-pro-latest',
        'gemini-2.5-pro'
      ];
      let itineraryText = '';
      let lastError = null;

      for (const modelName of modelsToTry) {
        for (let attempt = 1; attempt <= 2; attempt += 1) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            itineraryText = normalizeLineEndings(response.text());
            break;
          } catch (error) {
            lastError = error;
            const message = String(error?.message || '');
            const isOverloaded = message.includes('503') || message.includes('Service Unavailable');
            if (!isOverloaded) {
              throw error;
            }
            if (attempt < 2) {
              await sleep(800);
            }
          }
        }

        if (itineraryText) {
          break;
        }

        console.warn(`⚠️ Gemini model ${modelName} overloaded, trying fallback...`);
      }

      if (!itineraryText && lastError) {
        throw lastError;
      }
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
          travelPace: travelPace || 'moderate',
          accommodationType: accommodationType || 'hotel',
          tripStyles: Array.isArray(tripStyles) ? tripStyles : (tripType ? [tripType] : []),
          mustSee: Array.isArray(mustSee) ? mustSee : [],
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
    body('travelPace').optional().isIn(['relaxed', 'moderate', 'packed']).withMessage('Invalid travel pace'),
    body('accommodationType')
      .optional()
      .isIn(['hostel', 'hotel', 'resort', 'airbnb'])
      .withMessage('Invalid accommodation type'),
    body('tripStyles').optional().isArray({ max: 2 }).withMessage('Trip styles must be an array of up to 2'),
    body('mustSee').optional().isArray().withMessage('Must-see must be an array'),
    body('itineraryText').trim().notEmpty().withMessage('Itinerary text is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      location,
      startDate,
      endDate,
      adults,
      children,
      budget,
      budgetType,
      travelPace,
      accommodationType,
      tripStyles,
      mustSee,
      tripType,
      specialRequests,
      itineraryText
    } = req.body;

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
        travelPace: travelPace || 'moderate',
        accommodationType: accommodationType || 'hotel',
        tripStyles: Array.isArray(tripStyles) ? tripStyles : (tripType ? [tripType] : []),
        mustSee: Array.isArray(mustSee) ? mustSee : [],
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
    const itineraries = await Itinerary.find({
      user: req.user._id,
      deletedAt: null
    }).sort({ createdAt: -1 });

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
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      deletedAt: null
    });

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
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      deletedAt: null
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Check if itinerary belongs to logged-in user
    if (itinerary.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this itinerary' });
    }

    itinerary.deletedAt = new Date();
    await itinerary.save();

    res.json({ message: 'Itinerary deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete itinerary', error: error.message });
  }
});

export default router;
