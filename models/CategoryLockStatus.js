const mongoose = require('mongoose');

const categoryLockStatusSchema = new mongoose.Schema(
  {
    /** Reference to the owner user */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /** Category display name */
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    /** Emoji icon */
    icon: { type: String, default: '🔒' },
    /** Human-readable unlock condition description */
    condition: { type: String, default: '' },
    /** Motivational text shown on the card */
    motivationText: { type: String, default: '' },
    /** Progress target to unlock (e.g. 7 transactions) */
    target: { type: Number, required: [true, 'Target is required'], min: 0 },
    /** Current progress towards unlocking */
    currentProgress: { type: Number, default: 0, min: 0 },
    /** Whether the category is unlocked */
    isUnlocked: { type: Boolean, default: false },
    /** Gradient color values for the card (stored as int ARGB values) */
    colors: { type: [Number], default: [] },
    /** Cost in coins to unlock immediately */
    unlockCost: { type: Number, default: 0, min: 0 },
    /** Total amount spent in this category */
    totalSpent: { type: Number, default: 0, min: 0 },
    /** Total number of transactions in this category */
    transactionCount: { type: Number, default: 0, min: 0 },
    /** Whether this is a user-created custom category */
    isCustom: { type: Boolean, default: false },
  },
  { timestamps: true }
);

categoryLockStatusSchema.index({ userId: 1, name: 1 }, { unique: true });
categoryLockStatusSchema.index({ userId: 1, isUnlocked: 1 });

module.exports = mongoose.model('CategoryLockStatus', categoryLockStatusSchema);
