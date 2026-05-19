const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    /** Reference to the owner user */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /** Goal title */
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    /** Goal description */
    description: {
      type: String,
      default: '',
    },
    /** Current saved amount */
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative'],
    },
    /** Target amount to reach */
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [0, 'Target amount cannot be negative'],
    },
    /** Goal deadline date */
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    /** Goal category */
    category: {
      type: String,
      default: 'General',
    },
    /** Material icon code point */
    icon: {
      type: Number,
      default: 0,
    },
    /** Gradient color values array */
    gradientColors: {
      type: [Number],
      default: [],
    },
    /** Emoji representation of the goal */
    emoji: {
      type: String,
      default: '🎯',
    },
    /** Priority level */
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    /** Whether reminder is enabled */
    hasReminder: {
      type: Boolean,
      default: false,
    },
    /** Goal status: 0=active, 1=completed */
    status: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
    /** Last time the goal was updated */
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, deadline: 1 });

module.exports = mongoose.model('Goal', goalSchema);
