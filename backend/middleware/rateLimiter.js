import RateLimitUsage from '../models/RateLimitUsage.js';

const getWindowStart = (date, window) => {
  const start = new Date(date);

  if (window === 'minute') {
    start.setSeconds(0, 0);
    return start;
  }

  start.setHours(0, 0, 0, 0);
  return start;
};

const estimateTokensFromText = (text) => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};

const getLimitConfig = () => ({
  globalRpm: Number(process.env.GLOBAL_RPM || 5),
  globalTpm: Number(process.env.GLOBAL_TPM || 250000),
  globalRpd: Number(process.env.GLOBAL_RPD || 20),
  userRpm: Number(process.env.USER_RPM || 1),
  userTpm: Number(process.env.USER_TPM || 50000),
  userRpd: Number(process.env.USER_RPD || 5)
});

const buildRetryAfterSeconds = (now, window) => {
  if (window === 'minute') {
    const next = new Date(now);
    next.setSeconds(60, 0);
    return Math.max(1, Math.ceil((next - now) / 1000));
  }

  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return Math.max(1, Math.ceil((next - now) / 1000));
};

const fetchUsage = async ({ scope, userId, window, windowStart }) => {
  return RateLimitUsage.findOne({
    scope,
    user: userId || null,
    window,
    windowStart
  });
};

const reserveUsage = async ({ scope, userId, window, windowStart, requestInc, tokenInc }) => {
  const update = {
    $inc: {
      requestCount: requestInc,
      tokenCount: tokenInc
    }
  };

  return RateLimitUsage.findOneAndUpdate(
    { scope, user: userId || null, window, windowStart },
    update,
    { upsert: true, new: true }
  );
};

const applyTokenAdjustment = async ({ scope, userId, window, windowStart, tokenDelta }) => {
  if (!tokenDelta) return;

  await RateLimitUsage.updateOne(
    { scope, user: userId || null, window, windowStart },
    { $inc: { tokenCount: tokenDelta } }
  );
};

export const checkAndReserveRateLimit = async ({ userId, estimatedTokens }) => {
  const now = new Date();
  const minuteStart = getWindowStart(now, 'minute');
  const dayStart = getWindowStart(now, 'day');
  const limits = getLimitConfig();

  const [globalMinute, globalDay, userMinute, userDay] = await Promise.all([
    fetchUsage({ scope: 'global', window: 'minute', windowStart: minuteStart }),
    fetchUsage({ scope: 'global', window: 'day', windowStart: dayStart }),
    fetchUsage({ scope: 'user', userId, window: 'minute', windowStart: minuteStart }),
    fetchUsage({ scope: 'user', userId, window: 'day', windowStart: dayStart })
  ]);

  const globalMinuteRequests = globalMinute?.requestCount || 0;
  const globalMinuteTokens = globalMinute?.tokenCount || 0;
  const globalDayRequests = globalDay?.requestCount || 0;
  const userMinuteRequests = userMinute?.requestCount || 0;
  const userMinuteTokens = userMinute?.tokenCount || 0;
  const userDayRequests = userDay?.requestCount || 0;

  if (globalMinuteRequests + 1 > limits.globalRpm) {
    return { allowed: false, retryAfterSeconds: buildRetryAfterSeconds(now, 'minute'), retryWindow: 'minute' };
  }

  if (globalMinuteTokens + estimatedTokens > limits.globalTpm) {
    return { allowed: false, retryAfterSeconds: buildRetryAfterSeconds(now, 'minute'), retryWindow: 'minute' };
  }

  if (globalDayRequests + 1 > limits.globalRpd) {
    return { allowed: false, retryAfterSeconds: buildRetryAfterSeconds(now, 'day'), retryWindow: 'day' };
  }

  if (userMinuteRequests + 1 > limits.userRpm) {
    return { allowed: false, retryAfterSeconds: buildRetryAfterSeconds(now, 'minute'), retryWindow: 'minute' };
  }

  if (userMinuteTokens + estimatedTokens > limits.userTpm) {
    return { allowed: false, retryAfterSeconds: buildRetryAfterSeconds(now, 'minute'), retryWindow: 'minute' };
  }

  if (userDayRequests + 1 > limits.userRpd) {
    return { allowed: false, retryAfterSeconds: buildRetryAfterSeconds(now, 'day'), retryWindow: 'day' };
  }

  await Promise.all([
    reserveUsage({ scope: 'global', window: 'minute', windowStart: minuteStart, requestInc: 1, tokenInc: estimatedTokens }),
    reserveUsage({ scope: 'global', window: 'day', windowStart: dayStart, requestInc: 1, tokenInc: estimatedTokens }),
    reserveUsage({ scope: 'user', userId, window: 'minute', windowStart: minuteStart, requestInc: 1, tokenInc: estimatedTokens }),
    reserveUsage({ scope: 'user', userId, window: 'day', windowStart: dayStart, requestInc: 1, tokenInc: estimatedTokens })
  ]);

  return { allowed: true, minuteStart, dayStart, limits };
};

export const finalizeRateLimitUsage = async ({ userId, minuteStart, dayStart, tokenDelta }) => {
  await Promise.all([
    applyTokenAdjustment({ scope: 'global', window: 'minute', windowStart: minuteStart, tokenDelta }),
    applyTokenAdjustment({ scope: 'global', window: 'day', windowStart: dayStart, tokenDelta }),
    applyTokenAdjustment({ scope: 'user', userId, window: 'minute', windowStart: minuteStart, tokenDelta }),
    applyTokenAdjustment({ scope: 'user', userId, window: 'day', windowStart: dayStart, tokenDelta })
  ]);
};

export const getCurrentWindowStarts = () => {
  const now = new Date();
  return {
    minuteStart: getWindowStart(now, 'minute'),
    dayStart: getWindowStart(now, 'day')
  };
};

export const getLimitSettings = () => getLimitConfig();

export { estimateTokensFromText };
