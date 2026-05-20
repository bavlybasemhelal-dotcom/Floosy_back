const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema(
  {
    /** Reference to the owner user */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    /** Experience points */
    xp: {
      type: Number,
      default: 0,
      min: [0, 'XP cannot be negative'],
    },
    /** In-app currency */
    coins: {
      type: Number,
      default: 0,
      min: [0, 'Coins cannot be negative'],
    },
    /** Current level */
    level: {
      type: Number,
      default: 1,
      min: [1, 'Level must be at least 1'],
    },
    /** Consecutive days streak */
    streak: {
      type: Number,
      default: 0,
    },
    /** Last activity update timestamp */
    lastUpdate: {
      type: Date,
      default: Date.now,
    },
    /** Date the user first opened the app */
    appFirstOpenDate: {
      type: Date,
      default: Date.now,
    },
    /** List of unlocked category names */
    unlockedCategories: {
      type: [String],
      default: ['Food', 'Transport', 'Bills'],
    },
    /** List of earned badge identifiers */
    earnedBadges: {
      type: [String],
      default: [],
    },
    /** Whether user has premium access */
    isPremium: {
      type: Boolean,
      default: false,
    },
    /** Whether multi-currency is unlocked */
    isMultiCurrencyUnlocked: {
      type: Boolean,
      default: false,
    },
    /** Whether user has used the free trial */
    hasUsedTrial: {
      type: Boolean,
      default: false,
    },
    /** Premium subscription expiration date */
    premiumExpiresAt: {
      type: Date,
      default: null,
    },
    /** Trial start date */
    trialStartedAt: {
      type: Date,
      default: null,
    },
    /** Subscription plan tier */
    subscriptionPlan: {
      type: String,
      enum: ['free', 'premium', 'elite'],
      default: 'free',
    },
    /** Subscription billing cycle */
    subscriptionCycle: {
      type: String,
      enum: ['none', 'monthly', 'yearly', 'lifetime'],
      default: 'none',
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model('UserStats', userStatsSchema);
