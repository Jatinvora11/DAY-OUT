import cron from 'node-cron';
import RateLimitUsage from '../models/RateLimitUsage.js';

/**
 * Schedule hourly cleanup of expired rate-limit window records.
 * Keeps only the last 25 hours of data (covers current day window + buffer).
 */
const scheduleRateLimitCleanup = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const cutoff = new Date(Date.now() - 25 * 60 * 60 * 1000);
      const result = await RateLimitUsage.deleteMany({ windowStart: { $lt: cutoff } });
      console.log(`🧹 Rate limit cleanup: removed ${result.deletedCount} stale record(s)`);
    } catch (err) {
      console.error('❌ Rate limit cleanup failed:', err.message);
    }
  });

  console.log('⏰ Rate limit cleanup job scheduled (hourly)');
};

export default scheduleRateLimitCleanup;
