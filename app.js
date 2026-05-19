const express = require('express');
const cors = require('cors');

const app = express();

// ── Global Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Route Mounting ─────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
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
