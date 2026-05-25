import mongoose from 'mongoose';

const itinerarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  adults: {
    type: Number,
    required: true,
    min: 1
  },
  children: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  budgetType: {
    type: String,
    enum: ['overall', 'per_person'],
    default: 'overall'
  },
  travelPace: {
    type: String,
    enum: ['relaxed', 'moderate', 'packed'],
    default: 'moderate'
  },
  accommodationType: {
    type: String,
    enum: ['hostel', 'hotel', 'resort', 'airbnb'],
    default: 'hotel'
  },
  tripStyles: {
    type: [String],
    default: []
  },
  mustSee: {
    type: [String],
    default: []
  },
  tripType: {
    type: String,
    enum: ['leisure', 'adventure', 'cultural', 'business'],
    required: false
  },
  specialRequests: {
    type: String,
    default: ''
  },
  itineraryText: {
    type: String,
    required: true
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

itinerarySchema.index({ user: 1, createdAt: -1 });
itinerarySchema.index({ user: 1 });

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

export default Itinerary;
