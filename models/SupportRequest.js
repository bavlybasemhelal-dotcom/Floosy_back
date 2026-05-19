const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    type: { type: String, enum: ['type_bug', 'type_feature', 'type_inquiry', 'type_other'], required: true },
    otherType: { type: String, default: null },
    message: { type: String, required: true },
    urgency: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  },
  { timestamps: true }
);

supportRequestSchema.index({ userId: 1, status: 1 });
module.exports = mongoose.model('SupportRequest', supportRequestSchema);
