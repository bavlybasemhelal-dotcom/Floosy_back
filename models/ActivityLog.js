const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    memberId: { type: String, required: [true, 'Member ID is required'] },
    memberName: { type: String, required: [true, 'Member name is required'], trim: true },
    action: { type: String, required: [true, 'Action is required'], trim: true },
    details: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
    icon: { type: Number, default: 0 },
  },
  { timestamps: true }
);

activityLogSchema.index({ userId: 1, timestamp: -1 });
module.exports = mongoose.model('ActivityLog', activityLogSchema);
