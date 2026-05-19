const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema(
  {
    /** Reference to the owner user */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /** Challenge title */
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    /** Challenge description */
    description: {
      type: String,
      default: '',
    },
    /** Emoji icon for the challenge */
    icon: {
      type: String,
      default: '🎯',
    },
    /** XP reward upon completion */
    rewardXP: {
      type: Number,
      default: 0,
      min: [0, 'Reward XP cannot be negative'],
    },
    /** Coin reward upon completion */
    rewardCoins: {
      type: Number,
      default: 0,
      min: [0, 'Reward coins cannot be negative'],
    },
    /** Target number to reach (e.g. days, check-ins) */
    target: {
      type: Number,
      required: [true, 'Target is required'],
      min: [0, 'Target cannot be negative'],
    },
    /** Current progress towards target */
    progress: {
      type: Number,
      default: 0,
    },
    /** Challenge type: 0=daily, 1=weekly, 2=custom */
    type: {
      type: Number,
      enum: [0, 1, 2],
      default: 0,
    },
    /** Difficulty level */
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    /** Challenge deadline */
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    /** Whether the challenge is completed */
    isCompleted: {
      type: Boolean,
      default: false,
    },
    /** Whether the user has started the challenge */
    isStarted: {
      type: Boolean,
      default: false,
    },
    /** Last check-in timestamp */
    lastCheckIn: {
      type: Date,
      default: null,
    },
    /** Whether progress is tracked manually */
    isManual: {
      type: Boolean,
      default: true,
    },
    /** Custom interval in days (for custom type) */
    customIntervalDays: {
      type: Number,
      default: null,
    },
    /** Category constraint for validation */
    categoryConstraint: {
      type: String,
      default: null,
    },
    /** Amount constraint for validation */
    amountConstraint: {
      type: Number,
      default: null,
    },
    /** Whether this is a balance-based constraint */
    isBalanceConstraint: {
      type: Boolean,
      default: null,
    },
    /** Whether the constraint is inverted (e.g. 0 expenses) */
    isInvertedConstraint: {
      type: Boolean,
      default: null,
    },
  },
  { timestamps: true }
);

challengeSchema.index({ userId: 1, isCompleted: 1 });
challengeSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Challenge', challengeSchema);
