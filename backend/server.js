import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import scheduleRateLimitCleanup from './jobs/rateLimitCleanup.js';

import authRoutes from './routes/auth.js';
import itineraryRoutes from './routes/itinerary.js';
import contactRoutes from './routes/contact.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';

// ─── Database ────────────────────────────────────────────────────────────────
await connectDB();

// ─── Background jobs ─────────────────────────────────────────────────────────
scheduleRateLimitCleanup();

// ─── App setup ───────────────────────────────────────────────────────────────
const app = express();

// CORS
if (!process.env.FRONTEND_URL) {
  console.warn('⚠️  FRONTEND_URL is not set — defaulting to http://localhost:5173');
}

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

console.log('🌐 CORS allowed origins:', allowedOrigins);

// Global rate limiter (brute-force protection on all routes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
});

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(globalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'DayOut API' }));

// ─── Global error handler ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
