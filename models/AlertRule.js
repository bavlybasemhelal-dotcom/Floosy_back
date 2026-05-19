const mongoose = require('mongoose');

const alertRuleSchema = new mongoose.Schema(
  {
    /** Reference to the owner user */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /** Rule title */
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    /** Custom notification message when triggered */
    description: {
      type: String,
      default: '',
    },
    /** Rule type: 0=expenseThreshold, 1=savingThreshold, 2=categoryLimit */
    type: {
      type: Number,
      enum: [0, 1, 2],
      required: [true, 'Type is required'],
    },
    /** Category name for categoryLimit rules */
    category: {
      type: String,
      default: null,
    },
    /** Threshold amount that triggers the rule */
    threshold: {
      type: Number,
      required: [true, 'Threshold is required'],
      min: [0, 'Threshold cannot be negative'],
    },
    /** Whether the rule has already been triggered */
    isTriggered: {
      type: Boolean,
      default: false,
    },
    /** Whether the rule is currently active */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

alertRuleSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('AlertRule', alertRuleSchema);
