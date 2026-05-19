const UserStats = require('../models/UserStats');

/**
 * POST /api/subscription/activate
 * Activate a subscription plan.
 * Body: { plan: 'premium'|'elite', cycle: 'monthly'|'yearly' }
 *
 * Mirrors Flutter: GamificationProvider.activateFullPremium()
 *   - monthly → 30 days
 *   - yearly  → 365 days
 *   - Clears trialStartedAt (upgrade from trial)
 */
const activate = async (req, res) => {
  try {
    const { plan, cycle } = req.body;

    if (!plan || !['premium', 'elite'].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan. Must be "premium" or "elite"',
        data: null,
      });
    }

    if (!cycle || !['monthly', 'yearly'].includes(cycle)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cycle. Must be "monthly" or "yearly"',
        data: null,
      });
    }

    const durationDays = cycle === 'yearly' ? 365 : 30;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const stats = await UserStats.findOneAndUpdate(
      { userId: req.user.id },
      {
        isPremium: true,
        subscriptionPlan: plan,
        subscriptionCycle: cycle,
        premiumExpiresAt: expiresAt,
        trialStartedAt: null,
      },
      { new: true, runValidators: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: `${plan} subscription activated (${cycle})`,
      data: {
        isPremium: stats.isPremium,
        subscriptionPlan: stats.subscriptionPlan,
        subscriptionCycle: stats.subscriptionCycle,
        premiumExpiresAt: stats.premiumExpiresAt,
        trialStartedAt: stats.trialStartedAt,
        hasUsedTrial: stats.hasUsedTrial,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * POST /api/subscription/cancel
 * Cancel the active subscription.
 *
 * Mirrors Flutter: GamificationProvider.cancelTrial()
 *   - Sets isPremium to false
 *   - Clears expiration and trial dates
 *   - Resets plan to free
 */
const cancel = async (req, res) => {
  try {
    const stats = await UserStats.findOneAndUpdate(
      { userId: req.user.id },
      {
        isPremium: false,
        subscriptionPlan: 'free',
        subscriptionCycle: 'none',
        premiumExpiresAt: null,
        trialStartedAt: null,
      },
      { new: true, runValidators: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled',
      data: {
        isPremium: stats.isPremium,
        subscriptionPlan: stats.subscriptionPlan,
        subscriptionCycle: stats.subscriptionCycle,
        premiumExpiresAt: stats.premiumExpiresAt,
        trialStartedAt: stats.trialStartedAt,
        hasUsedTrial: stats.hasUsedTrial,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * POST /api/subscription/trial
 * Activate a 7-day free trial.
 *
 * Mirrors Flutter: GamificationProvider.activate7DayTrial()
 *   - Blocked if hasUsedTrial is already true
 *   - Sets 7-day expiration
 */
const activateTrial = async (req, res) => {
  try {
    const stats = await UserStats.findOne({ userId: req.user.id });

    if (stats && stats.hasUsedTrial) {
      return res.status(400).json({
        success: false,
        message: 'Free trial has already been used',
        data: null,
      });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const updated = await UserStats.findOneAndUpdate(
      { userId: req.user.id },
      {
        isPremium: true,
        hasUsedTrial: true,
        trialStartedAt: now,
        premiumExpiresAt: expiresAt,
        subscriptionPlan: 'premium',
        subscriptionCycle: 'none',
      },
      { new: true, runValidators: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: '7-day free trial activated',
      data: {
        isPremium: updated.isPremium,
        subscriptionPlan: updated.subscriptionPlan,
        premiumExpiresAt: updated.premiumExpiresAt,
        trialStartedAt: updated.trialStartedAt,
        hasUsedTrial: updated.hasUsedTrial,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * GET /api/subscription/status
 * Return current subscription status for the logged-in user.
 */
const getStatus = async (req, res) => {
  try {
    let stats = await UserStats.findOne({ userId: req.user.id });
    if (!stats) stats = await UserStats.create({ userId: req.user.id });

    const now = new Date();
    const isActive =
      stats.isPremium &&
      (!stats.premiumExpiresAt || stats.premiumExpiresAt > now);

    res.status(200).json({
      success: true,
      message: 'Subscription status retrieved',
      data: {
        isActive,
        plan: isActive ? stats.subscriptionPlan : 'free',
        isPremium: stats.isPremium,
        subscriptionPlan: stats.subscriptionPlan,
        subscriptionCycle: stats.subscriptionCycle,
        premiumExpiresAt: stats.premiumExpiresAt,
        trialStartedAt: stats.trialStartedAt,
        hasUsedTrial: stats.hasUsedTrial,
        isTrial: isActive && !!stats.trialStartedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

module.exports = { activate, cancel, activateTrial, getStatus };
