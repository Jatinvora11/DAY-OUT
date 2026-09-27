import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  generateItinerary,
  saveItinerary,
  getUserItineraries,
  getItinerary,
  deleteItinerary,
} from '../controllers/itineraryController.js';

const router = express.Router();

// All itinerary routes require authentication
router.use(protect);

const tripInputRules = [
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
  body('tripStyles').optional().isArray({ max: 3 }).withMessage('Trip styles must be an array of up to 3'),
  body('mustSee').optional().isArray().withMessage('Must-see must be an array'),
];

router.post('/generate', tripInputRules, validate, generateItinerary);

router.post(
  '/save',
  [
    ...tripInputRules,
    body('itineraryText').trim().notEmpty().withMessage('Itinerary text is required'),
  ],
  validate,
  saveItinerary,
);

router.get('/user', getUserItineraries);
router.get('/:id', getItinerary);
router.delete('/:id', deleteItinerary);

export default router;
