const mongoose = require('mongoose');

const dashboardWidgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    selectedWidgets: { type: [String], default: [] },
    tier: { type: String, enum: ['starter', 'pro', 'elite'], default: 'starter' },
  },
  { timestamps: true }
);


module.exports = mongoose.model('DashboardWidget', dashboardWidgetSchema);
