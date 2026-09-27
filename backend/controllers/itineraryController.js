import Itinerary from '../models/Itinerary.js';
import generateContent from '../utils/gemini.js';
import buildItineraryPrompt from '../utils/itineraryPrompt.js';
import {
  checkAndReserveRateLimit,
  finalizeRateLimitUsage,
  estimateTokensFromText,
} from '../middleware/rateLimiter.js';

// POST /api/itinerary/generate
export const generateItinerary = async (req, res) => {
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
    tripType,
  } = req.body;

  const prompt = buildItineraryPrompt({
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
    tripType,
  });

  const estimatedTokens = estimateTokensFromText(prompt);
  let reservation = null;

  try {
    reservation = await checkAndReserveRateLimit({
      userId: req.user._id,
      estimatedTokens,
    });

    if (!reservation.allowed) {
      const { retryAfterSeconds, retryWindow } = reservation;
      const retryValue =
        retryWindow === 'day'
          ? Math.max(1, Math.ceil(retryAfterSeconds / 3600))
          : Math.max(1, Math.ceil(retryAfterSeconds / 60));
      const retryUnit = retryWindow === 'day' ? 'hours' : 'minutes';

      res.set('Retry-After', retryAfterSeconds.toString());
      return res.status(429).json({
        message: `Rate limit reached. Please try again after ${retryValue} ${retryUnit}.`,
      });
    }

    console.log('🤖 Calling Gemini API…');
    const itineraryText = await generateContent(prompt);

    const actualTokens =
      estimateTokensFromText(prompt) + estimateTokensFromText(itineraryText);
    const tokenDelta = actualTokens - estimatedTokens;

    await finalizeRateLimitUsage({
      userId: req.user._id,
      minuteStart: reservation.minuteStart,
      dayStart: reservation.dayStart,
      tokenDelta,
    });

    console.log('✅ Itinerary generated successfully');

    return res.json({
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
        tripStyles: Array.isArray(tripStyles)
          ? tripStyles
          : tripType
          ? [tripType]
          : [],
        mustSee: Array.isArray(mustSee) ? mustSee : [],
        specialRequests,
      },
    });
  } catch (err) {
    // Roll back token reservation on failure
    if (reservation?.allowed) {
      await finalizeRateLimitUsage({
        userId: req.user._id,
        minuteStart: reservation.minuteStart,
        dayStart: reservation.dayStart,
        tokenDelta: 0,
      });
    }
    console.error('❌ Gemini API Error:', err.message);
    return res.status(500).json({ message: 'Failed to generate itinerary', error: err.message });
  }
};

// POST /api/itinerary/save
export const saveItinerary = async (req, res) => {
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
    itineraryText,
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
      tripStyles: Array.isArray(tripStyles) ? tripStyles : tripType ? [tripType] : [],
      mustSee: Array.isArray(mustSee) ? mustSee : [],
      tripType,
      specialRequests,
      itineraryText,
    });

    return res.status(201).json({ message: 'Itinerary saved successfully', itinerary });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to save itinerary', error: err.message });
  }
};

// GET /api/itinerary/user
export const getUserItineraries = async (req, res) => {
  try {
    const itineraries = await Itinerary.find({
      user: req.user._id,
      deletedAt: null,
    }).sort({ createdAt: -1 });

    return res.json(itineraries);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch itineraries', error: err.message });
  }
};

// GET /api/itinerary/:id
export const getItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      deletedAt: null,
    });

    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });

    if (itinerary.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this itinerary' });
    }

    return res.json(itinerary);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch itinerary', error: err.message });
  }
};

// DELETE /api/itinerary/:id
export const deleteItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      deletedAt: null,
    });

    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });

    if (itinerary.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this itinerary' });
    }

    itinerary.deletedAt = new Date();
    await itinerary.save();

    return res.json({ message: 'Itinerary deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete itinerary', error: err.message });
  }
};
