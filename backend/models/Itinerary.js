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
  tripType: {
    type: String,
    enum: ['leisure', 'adventure', 'cultural', 'business'],
    required: true
  },
  specialRequests: {
    type: String,
    default: ''
  },
  itineraryText: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

export default Itinerary;
