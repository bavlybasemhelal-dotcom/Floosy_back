const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, default: '' },
    type: { type: Number, enum: [0, 1, 2, 3], default: 2 },
    icon: { type: Number, default: 0 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

insightSchema.index({ userId: 1, createdAt: -1 });
module.exports = mongoose.model('Insight', insightSchema);
