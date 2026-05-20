const UserStats = require('../models/UserStats');
const Coupon = require('../models/Coupon');

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

/**
 * GET /api/subscription/coupons
 * Returns a list of 100 coupons. Generates them if they don't exist.
 */
const getCoupons = async (req, res) => {
  try {
    let coupons = await Coupon.find().sort({ createdAt: -1 });
    
    if (coupons.length < 100) {
      const newCoupons = [];
      const needed = 100 - coupons.length;
      for (let i = 0; i < needed; i++) {
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        newCoupons.push({ code: `FLOOSY-PRO-${randomString}` });
      }
      await Coupon.insertMany(newCoupons);
      coupons = await Coupon.find().sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      message: 'Coupons retrieved successfully',
      data: coupons,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * POST /api/subscription/redeem-coupon
 * Redeems a coupon and activates permanent premium.
 */
const redeemCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required', data: null });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid coupon code', data: null });
    }

    const previouslyUsedCoupon = await Coupon.findOne({ usedBy: req.user.id });
    if (previouslyUsedCoupon) {
      return res.status(400).json({ success: false, message: 'You have already redeemed a coupon. Only one coupon is allowed per user.', data: null });
    }

    if (coupon.isUsed) {
      return res.status(400).json({ success: false, message: 'This coupon is invalid or already used. Please use another coupon.', data: null });
    }

    // Mark as used
    coupon.isUsed = true;
    coupon.usedBy = req.user.id;
    coupon.usedAt = new Date();
    await coupon.save();

    // Upgrade user to permanent elite
    const stats = await UserStats.findOneAndUpdate(
      { userId: req.user.id },
      {
        isPremium: true,
        subscriptionPlan: 'elite',
        subscriptionCycle: 'lifetime',
        premiumExpiresAt: null,
        trialStartedAt: null,
      },
      { new: true, runValidators: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Premium Subscription activated',
      data: {
        isPremium: stats.isPremium,
        subscriptionPlan: stats.subscriptionPlan,
        subscriptionCycle: stats.subscriptionCycle,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

module.exports = { activate, cancel, activateTrial, getStatus, getCoupons, redeemCoupon };
