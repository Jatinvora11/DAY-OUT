import mongoose from 'mongoose';

const rateLimitUsageSchema = new mongoose.Schema({
  scope: {
    type: String,
    enum: ['global', 'user'],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  window: {
    type: String,
    enum: ['minute', 'day'],
    required: true
  },
  windowStart: {
    type: Date,
    required: true
  },
  requestCount: {
    type: Number,
    default: 0
  },
  tokenCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

rateLimitUsageSchema.index({ scope: 1, user: 1, window: 1, windowStart: 1 }, { unique: true });

const RateLimitUsage = mongoose.model('RateLimitUsage', rateLimitUsageSchema);

export default RateLimitUsage;
