const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const { getSeatRoom, setSocketServer } = require('./lib/realtime');

// Load environment variables
dotenv.config({ override: true });

const app = express();
app.set('trust proxy', 1);
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

const io = new Server(httpServer, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

setSocketServer(io);

io.on('connection', (socket) => {
  socket.on('seat-room:join', (payload = {}) => {
    const { scopeType, scopeId } = payload;
    if (!scopeType || !scopeId) return;
    socket.join(getSeatRoom(scopeType, scopeId));
  });

  socket.on('seat-room:leave', (payload = {}) => {
    const { scopeType, scopeId } = payload;
    if (!scopeType || !scopeId) return;
    socket.leave(getSeatRoom(scopeType, scopeId));
  });

  socket.on('live-match:join', (facilityId) => {
    if (!facilityId) return;
    socket.join(`live-match:${facilityId}`);
  });

  socket.on('live-match:leave', (facilityId) => {
    if (!facilityId) return;
    socket.leave(`live-match:${facilityId}`);
  });
});

// ─── Security Middleware ──────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Increased for development (was 100)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Hardened to 10 attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' }
});

// ─── Logging Redaction Middleware ─────────────────────────────────────────────
// Redact sensitive headers and PII from outgoing logs
morgan.token('safe-url', (req) => {
  return req.originalUrl.replace(/(token|password|email)=[^&]+/g, '$1=[REDACTED]');
});
morgan.token('auth-status', (req, res) => {
  return req.headers.authorization ? 'AUTH_PRESENT' : 'ANONYMOUS';
});

app.use(helmet());
app.use(limiter);

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
app.use(express.json({ limit: process.env.REQUEST_BODY_LIMIT || '5mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.REQUEST_BODY_LIMIT || '5mb' }));

// Using customized morgan for security
app.use(morgan(':method :safe-url :status :res[content-length] - :response-time ms [:auth-status]'));

// ─── Route Imports ────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const notificationRoutes = require('./routes/notification.routes');
const userRoutes = require('./routes/user.routes');
const gamehubRoutes = require('./routes/gamehub.routes');
const partnerRoutes = require('./routes/partner.routes');
const configRoutes = require('./routes/config.routes');
const couponRoutes = require('./routes/coupon.routes');
const liveMatchRoutes = require('./routes/live-match.routes');

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/gamehub', gamehubRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/config', configRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/live-match', liveMatchRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: '🚀 Book & Vibe API is running!',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Request payload too large. Please use a smaller banner image (recommended under 5MB).',
    });
  }
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`\n🎉 Book & Vibe Backend running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = { app, io, httpServer };
