// backend/server.js
// EcoTrack Backend API Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    // and allow all localhost and local Wi-Fi IP origins
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body Parser ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // max 20 login attempts per window
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const databaseReady = testConnection().catch((err) => {
  console.error('Database initialization failed during app import:', err.message);
  throw err;
});

app.use(async (req, res, next) => {
  try {
    await databaseReady;
    next();
  } catch (err) {
    next(err);
  }
});

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'EcoTrack API is running', timestamp: new Date().toISOString() });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth/login', loginLimiter);          // Rate limit login only
app.use('/api/auth', require('./routes/auth'));
app.use('/api/pickups', require('./routes/pickups'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found.` });
});

// ─── Centralized Error Handler ───────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
async function start() {
  await databaseReady;
  app.listen(PORT, HOST, () => {
    console.log(`🚀 EcoTrack API running on http://localhost:${PORT}`);
    console.log(`🌐 Network access: http://172.16.58.204:${PORT}`);
    console.log(`🌿 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  });
}

if (require.main === module) {
  start();
}

module.exports = app; // Export for testing
