const Challenge = require('../models/Challenge');

/**
 * GET /api/challenges
 * List all challenges for the authenticated user.
 * Supports filtering by type, difficulty, isCompleted, etc.
 * Also supports seeding default challenges if the user has none.
 */
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 50, sortBy = 'createdAt', order = 'desc', from, to, ...filters } = req.query;

    const query = { userId: req.user.id };

    // Apply filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== '') {
        if (filters[key] === 'true') query[key] = true;
        else if (filters[key] === 'false') query[key] = false;
        else query[key] = isNaN(filters[key]) ? filters[key] : Number(filters[key]);
      }
    });

    // Date range
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    let [data, total] = await Promise.all([
      Challenge.find(query).sort({ [sortBy]: sortOrder }).skip(skip).limit(Number(limit)),
      Challenge.countDocuments(query),
    ]);

    // Auto-seed default challenges for new users
    if (total === 0 && !filters.isCompleted && !filters.type) {
      const defaults = _getDefaultChallenges(req.user.id);
      await Challenge.insertMany(defaults);
      data = await Challenge.find({ userId: req.user.id }).sort({ [sortBy]: sortOrder });
      total = data.length;
      console.log(`🎯 Seeded ${total} default challenges for user ${req.user.id}`);
    }

    res.status(200).json({
      success: true,
      message: 'Data retrieved successfully',
      data: { items: data, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * GET /api/challenges/:id
 */
const getOne = async (req, res) => {
  try {
    const doc = await Challenge.findOne({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });
    res.status(200).json({ success: true, message: 'Data retrieved successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * POST /api/challenges
 * Create a new challenge for the authenticated user.
 */
const create = async (req, res) => {
  try {
    const body = { ...req.body, userId: req.user.id };
    const doc = await Challenge.create(body);
    res.status(201).json({ success: true, message: 'Created successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * PUT /api/challenges/:id
 * Update a challenge by ID.
 */
const update = async (req, res) => {
  try {
    const doc = await Challenge.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });
    res.status(200).json({ success: true, message: 'Updated successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * DELETE /api/challenges/:id
 */
const deleteOne = async (req, res) => {
  try {
    const doc = await Challenge.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });
    res.status(200).json({ success: true, message: 'Deleted successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * PUT /api/challenges/:id/checkin
 * Manual check-in for a challenge. Increments progress by 1.
 * Validates cooldowns to prevent double check-ins.
 */
const checkIn = async (req, res) => {
  try {
    const challenge = await Challenge.findOne({ _id: req.params.id, userId: req.user.id });
    if (!challenge) return res.status(404).json({ success: false, message: 'Not found', data: null });
    if (challenge.isCompleted) return res.status(400).json({ success: false, message: 'Already completed', data: null });

    const now = new Date();

    // Cooldown validations based on challenge type
    if (challenge.lastCheckIn) {
      const diffMs = now - challenge.lastCheckIn;
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (challenge.type === 0) {
        // Daily: only one check-in per calendar day
        const lastDate = challenge.lastCheckIn;
        if (
          lastDate.getFullYear() === now.getFullYear() &&
          lastDate.getMonth() === now.getMonth() &&
          lastDate.getDate() === now.getDate()
        ) {
          return res.status(400).json({ success: false, message: 'Already checked in today', data: null });
        }
      } else if (challenge.type === 1) {
        // Weekly: wait at least 6 days
        if (diffDays < 6) {
          return res.status(400).json({ success: false, message: 'Wait 6 days between check-ins', data: null });
        }
      } else if (challenge.type === 2 && challenge.customIntervalDays) {
        // Custom: wait for custom interval
        if (diffDays < (challenge.customIntervalDays - 1)) {
          return res.status(400).json({ success: false, message: 'Wait for next interval', data: null });
        }
      }
    }

    challenge.progress += 1;
    challenge.lastCheckIn = now;
    challenge.isStarted = true;

    if (challenge.progress >= challenge.target) {
      challenge.isCompleted = true;
    }

    await challenge.save();
    res.status(200).json({ success: true, message: 'Check-in successful', data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * PUT /api/challenges/:id/reset
 * Reset a challenge's progress (for missed deadlines or manual reset).
 */
const resetChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findOne({ _id: req.params.id, userId: req.user.id });
    if (!challenge) return res.status(404).json({ success: false, message: 'Not found', data: null });

    challenge.progress = 0;
    challenge.isCompleted = false;
    challenge.isStarted = false;
    challenge.lastCheckIn = null;

    // Optionally update deadline
    if (req.body.deadline) {
      challenge.deadline = new Date(req.body.deadline);
    }

    await challenge.save();
    res.status(200).json({ success: true, message: 'Challenge reset successfully', data: challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * Generate default challenges for a new user.
 * These match the Flutter hardcoded defaults exactly.
 */
function _getDefaultChallenges(userId) {
  const now = new Date();
  return [
    {
      userId,
      title: 'Wealth Builder 💰',
      description: 'Maintain a balance above 2,000 EGP.',
      icon: '💰',
      rewardXP: 500,
      rewardCoins: 100,
      target: 7,
      type: 0, // daily
      difficulty: 'Medium',
      deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      isManual: true,
      isBalanceConstraint: true,
      amountConstraint: 2000,
    },
    {
      userId,
      title: 'Caffeine Break ☕',
      description: 'Spend 0 EGP on "Coffee" for 3 consecutive days.',
      icon: '☕',
      rewardXP: 300,
      rewardCoins: 50,
      target: 3,
      type: 0,
      difficulty: 'Easy',
      deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      isManual: true,
      categoryConstraint: 'Coffee',
      isInvertedConstraint: true,
    },
    {
      userId,
      title: 'Data Ninja 🥷',
      description: 'Record at least 3 transactions today.',
      icon: '🥷',
      rewardXP: 400,
      rewardCoins: 80,
      target: 1,
      type: 0,
      difficulty: 'Easy',
      deadline: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      isManual: true,
      amountConstraint: 3,
    },
    {
      userId,
      title: 'Financial Discipline 📈',
      description: 'Keep daily expenses below 300 EGP for 5 days.',
      icon: '📈',
      rewardXP: 1000,
      rewardCoins: 200,
      target: 5,
      type: 0,
      difficulty: 'Hard',
      deadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      isManual: true,
      amountConstraint: 300,
      isInvertedConstraint: true,
    },
  ];
}

module.exports = { getAll, getOne, create, update, deleteOne, checkIn, resetChallenge };
