const UserStats = require('../models/UserStats');

/**
 * Middleware: Check if the authenticated user has an active premium subscription.
 *
 * Validation logic mirrors Flutter's UserStats.isPremiumActive:
 *   - isPremium must be true
 *   - premiumExpiresAt must be in the future (if set)
 *
 * Usage: router.get('/premium-feature', auth, checkSubscription, handler)
 */
const checkSubscription = async (req, res, next) => {
  try {
    const stats = await UserStats.findOne({ userId: req.user.id });

    if (!stats) {
      return res.status(403).json({
        success: false,
        message: 'Subscription required to access this feature',
        data: null,
      });
    }

    const now = new Date();
    const isActive =
      stats.isPremium &&
      (!stats.premiumExpiresAt || stats.premiumExpiresAt > now);

    if (!isActive) {
      return res.status(403).json({
        success: false,
        message: 'Subscription required to access this feature',
        data: null,
      });
    }

    // Attach subscription info to the request for downstream handlers
    req.subscription = {
      plan: stats.subscriptionPlan,
      cycle: stats.subscriptionCycle,
      expiresAt: stats.premiumExpiresAt,
      isTrial: !!stats.trialStartedAt,
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

module.exports = checkSubscription;
