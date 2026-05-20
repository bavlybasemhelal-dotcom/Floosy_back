const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();

// ── Rate Limiters ───────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: 'تم تجاوز الحد الأقصى للطلبات، يرجى المحاولة لاحقاً.', data: null },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // limit each IP to 10 requests per windowMs
  message: { success: false, message: 'تم تجاوز الحد الأقصى لطلبات المصادقة، يرجى المحاولة لاحقاً.', data: null },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// ── Global Middleware ───────────────────────────────────────────────
// 1. Helmet (Configured for Mobile API)
app.use(helmet({
  contentSecurityPolicy: false, // Not strictly needed for APIs without HTML
  crossOriginEmbedderPolicy: false,
}));

// 2. CORS
app.use(cors());

// 3. Global Rate Limiting
app.use(globalLimiter);

// 4. Body Parser (10kb limit)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. NoSQL Injection Protection with Logging
app.use((req, res, next) => {
  const checkKeys = (obj) => {
    if (!obj) return false;
    for (const key in obj) {
      if (key.includes('$') || key.includes('.')) return true;
      if (typeof obj[key] === 'object') {
        if (checkKeys(obj[key])) return true;
      }
    }
    return false;
  };

  if (checkKeys(req.body) || checkKeys(req.params) || checkKeys(req.query)) {
    console.warn(`[SECURITY] Blocked/Sanitized NoSQL Injection attempt from IP: ${req.ip} - URL: ${req.originalUrl}`);
  }
  next();
});

app.use(mongoSanitize({
  replaceWith: '_'
}));

// ── Route Mounting ─────────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/challenges', require('./routes/challenges'));
app.use('/api/user-stats', require('./routes/userStats'));
app.use('/api/smart-alerts', require('./routes/smartAlerts'));
app.use('/api/alert-rules', require('./routes/alertRules'));
app.use('/api/shared-members', require('./routes/sharedMembers'));
app.use('/api/product-offers', require('./routes/productOffers'));
app.use('/api/support-requests', require('./routes/supportRequests'));
app.use('/api/activity-logs', require('./routes/activityLogs'));
app.use('/api/insights', require('./routes/insights'));
app.use('/api/category-locks', require('./routes/categoryLocks'));
app.use('/api/dashboard-widgets', require('./routes/dashboardWidgets'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/upload', require('./routes/upload'));

// ── Health Check ───────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Floosy API is healthy ✅', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Floosy API is running 🚀', data: null });
});

// ── 404 Handler ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', data: null });
});

// ── Global Error Handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error', data: null });
});

module.exports = app;
