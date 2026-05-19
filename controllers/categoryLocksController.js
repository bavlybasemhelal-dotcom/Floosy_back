const CategoryLockStatus = require('../models/CategoryLockStatus');
const Expense = require('../models/Expense');
const { resolveWalletOwner } = require('../middleware/resolveOwner');

/**
 * Default category locks that match the Flutter UI exactly.
 * Colors are stored as ARGB integer values (Flutter Color.value format).
 */
const DEFAULT_CATEGORY_LOCKS = [
  {
    name: 'Food',
    icon: '🍔',
    condition: 'Always available',
    motivationText: 'Fuel for your body.',
    target: 0,
    isUnlocked: true,
    colors: [0xFFFF9800, 0xFFFF5252], // Colors.orange, Colors.redAccent
    unlockCost: 0,
  },
  {
    name: 'Transport',
    icon: '🚕',
    condition: 'Always available',
    motivationText: 'Get where you need to go.',
    target: 0,
    isUnlocked: true,
    colors: [0xFF2196F3, 0xFF00BCD4], // Colors.blue, Colors.cyan
    unlockCost: 0,
  },
  {
    name: 'Bills',
    icon: '💡',
    condition: 'Always available',
    motivationText: 'Keep the lights on.',
    target: 0,
    isUnlocked: true,
    colors: [0xFFFFEB3B, 0xFFFF9800], // Colors.yellow, Colors.orangeAccent
    unlockCost: 0,
  },
  {
    name: 'Investment',
    icon: '📈',
    condition: '7 Expenses or 500 Coins',
    motivationText: 'Grow your wealth for the future.',
    target: 7,
    isUnlocked: false,
    colors: [0xFF2E7D32, 0xFF69F0AE], // Color(0xFF2E7D32), Colors.greenAccent
    unlockCost: 500,
  },
  {
    name: 'Travel',
    icon: '✈️',
    condition: '15 Transactions or 1000 Coins',
    motivationText: 'Explore the world.',
    target: 15,
    isUnlocked: false,
    colors: [0xFF448AFF, 0xFFE040FB], // Colors.blueAccent, Colors.purpleAccent
    unlockCost: 1000,
  },
  {
    name: 'Business',
    icon: '💼',
    condition: 'Level 5 or 2000 Coins',
    motivationText: 'Build your empire.',
    target: 5,
    isUnlocked: false,
    colors: [0xFF673AB7, 0xFF536DFE], // Colors.deepPurple, Colors.indigoAccent
    unlockCost: 2000,
  },
  {
    name: 'Fitness',
    icon: '🏋️',
    condition: '3 Day Streak or 200 Coins',
    motivationText: 'Strong mind, strong body.',
    target: 3,
    isUnlocked: false,
    colors: [0xFFFF4081, 0xFFFF5252], // Colors.pinkAccent, Colors.redAccent
    unlockCost: 200,
  },
];

/**
 * Seed default categories for a user if they have none.
 * This is idempotent — calling it multiple times has no effect once seeded.
 */
async function seedDefaultsForUser(userId) {
  const count = await CategoryLockStatus.countDocuments({ userId });
  if (count === 0) {
    const docs = DEFAULT_CATEGORY_LOCKS.map((c) => ({
      ...c,
      userId,
      totalSpent: 0,
      transactionCount: 0,
      currentProgress: 0,
      isCustom: false,
    }));
    await CategoryLockStatus.insertMany(docs);
    console.log(`🔓 Seeded ${docs.length} default category locks for user ${userId}`);

    // After seeding, sync with any existing expenses the user may already have
    await _syncAllCategoryTotals(userId);
    return true;
  }
  return false;
}

/**
 * Recalculate totalSpent and transactionCount for a single category
 * by aggregating from the actual Expense documents.
 */
async function _syncCategoryTotals(userId, categoryName) {
  if (!categoryName) return;

  const results = await Expense.aggregate([
    {
      $match: {
        $expr: { $eq: [{ $toString: '$userId' }, userId.toString()] },
        category: categoryName,
      },
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$amount' },
        transactionCount: { $sum: 1 },
      },
    },
  ]);

  const totals = results[0] || { totalSpent: 0, transactionCount: 0 };

  const catLock = await CategoryLockStatus.findOne({ userId, name: categoryName });
  if (catLock) {
    catLock.totalSpent = Math.round(totals.totalSpent * 100) / 100;
    catLock.transactionCount = totals.transactionCount;

    // Update progress towards unlocking based on transaction count
    if (!catLock.isUnlocked && catLock.target > 0) {
      catLock.currentProgress = totals.transactionCount;
      if (catLock.currentProgress >= catLock.target) {
        catLock.isUnlocked = true;
      }
    }

    await catLock.save();
  }
}

/**
 * Sync totals for ALL categories of a user.
 */
async function _syncAllCategoryTotals(userId) {
  const categories = await CategoryLockStatus.find({ userId }).select('name');
  for (const cat of categories) {
    await _syncCategoryTotals(userId, cat.name);
  }
}

/**
 * GET /api/category-locks
 * List all category locks for the user. Auto-seeds defaults for new users.
 * Also syncs financial data with actual expenses on every fetch.
 */
const getAll = async (req, res) => {
  try {
    const effectiveOwner = await resolveWalletOwner(req.user.id);
    const { page = 1, limit = 50, sortBy = 'createdAt', order = 'asc', ...filters } = req.query;

    // Auto-seed for new users
    const seeded = await seedDefaultsForUser(effectiveOwner);

    // If not freshly seeded, sync totals from actual expenses
    // (seeding already does this, so skip the double work)
    if (!seeded) {
      await _syncAllCategoryTotals(effectiveOwner);
    }

    const query = { userId: effectiveOwner };

    // Apply filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== '') {
        if (filters[key] === 'true') query[key] = true;
        else if (filters[key] === 'false') query[key] = false;
        else query[key] = isNaN(filters[key]) ? filters[key] : Number(filters[key]);
      }
    });

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      CategoryLockStatus.find(query).sort({ [sortBy]: sortOrder }).skip(skip).limit(Number(limit)),
      CategoryLockStatus.countDocuments(query),
    ]);

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
 * GET /api/category-locks/:id
 */
const getOne = async (req, res) => {
  try {
    const effectiveOwner = await resolveWalletOwner(req.user.id);
    const doc = await CategoryLockStatus.findOne({ _id: req.params.id, userId: effectiveOwner });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });

    // Sync this single category's totals before returning
    await _syncCategoryTotals(effectiveOwner, doc.name);
    const refreshed = await CategoryLockStatus.findById(doc._id);

    res.status(200).json({ success: true, message: 'Data retrieved successfully', data: refreshed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * POST /api/category-locks
 * Create a new category lock (custom category).
 */
const create = async (req, res) => {
  try {
    const effectiveOwner = await resolveWalletOwner(req.user.id);
    const body = {
      ...req.body,
      userId: effectiveOwner,
      isCustom: true,
      totalSpent: 0,
      transactionCount: 0,
      currentProgress: 0,
    };
    const doc = await CategoryLockStatus.create(body);

    // Sync in case there are already expenses with this category name
    await _syncCategoryTotals(effectiveOwner, doc.name);
    const refreshed = await CategoryLockStatus.findById(doc._id);

    res.status(201).json({ success: true, message: 'Created successfully', data: refreshed });
  } catch (error) {
    // Handle duplicate name
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A category with this name already exists', data: null });
    }
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * PUT /api/category-locks/:id
 * Update a category lock (progress, unlock status, financial data, etc.)
 * Prevents overwriting totalSpent/transactionCount from the client side —
 * those are always computed from actual expenses.
 */
const update = async (req, res) => {
  try {
    const effectiveOwner = await resolveWalletOwner(req.user.id);

    // Protect computed fields from being overwritten by client requests
    const safeBody = { ...req.body };
    delete safeBody.totalSpent;
    delete safeBody.transactionCount;
    delete safeBody.userId;

    const doc = await CategoryLockStatus.findOneAndUpdate(
      { _id: req.params.id, userId: effectiveOwner },
      safeBody,
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });
    res.status(200).json({ success: true, message: 'Updated successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * PUT /api/category-locks/:id/unlock
 * Unlock a category (set isUnlocked = true, optionally deduct coins).
 */
const unlock = async (req, res) => {
  try {
    const effectiveOwner = await resolveWalletOwner(req.user.id);
    const doc = await CategoryLockStatus.findOne({ _id: req.params.id, userId: effectiveOwner });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });

    if (doc.isUnlocked) {
      return res.status(400).json({ success: false, message: 'Already unlocked', data: doc });
    }

    doc.isUnlocked = true;
    doc.currentProgress = doc.target;
    await doc.save();

    res.status(200).json({ success: true, message: 'Category unlocked successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * PUT /api/category-locks/:id/progress
 * Increment progress for a category lock.
 * Body: { amount: Number, spent: Number (optional) }
 */
const updateProgress = async (req, res) => {
  try {
    const effectiveOwner = await resolveWalletOwner(req.user.id);
    const doc = await CategoryLockStatus.findOne({ _id: req.params.id, userId: effectiveOwner });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });

    const { amount = 1, spent = 0 } = req.body;

    doc.currentProgress += Number(amount);
    doc.transactionCount += 1;
    doc.totalSpent += Number(spent);

    // Auto-unlock if progress reaches target
    if (!doc.isUnlocked && doc.target > 0 && doc.currentProgress >= doc.target) {
      doc.isUnlocked = true;
    }

    await doc.save();
    res.status(200).json({ success: true, message: 'Progress updated', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * POST /api/category-locks/sync
 * Force a full recalculation of all category totals from actual expenses.
 * Useful when data might be out of sync or after bulk imports.
 */
const syncTotals = async (req, res) => {
  try {
    const effectiveOwner = await resolveWalletOwner(req.user.id);

    // Seed if new user
    await seedDefaultsForUser(effectiveOwner);

    // Full sync
    await _syncAllCategoryTotals(effectiveOwner);

    const data = await CategoryLockStatus.find({ userId: effectiveOwner }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, message: 'All category totals synced successfully', data: { items: data, total: data.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * DELETE /api/category-locks/:id
 * Delete a category lock (only custom categories can be deleted).
 */
const deleteOne = async (req, res) => {
  try {
    const effectiveOwner = await resolveWalletOwner(req.user.id);

    // Check if it's a default category (prevent deletion)
    const doc = await CategoryLockStatus.findOne({ _id: req.params.id, userId: effectiveOwner });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });

    if (!doc.isCustom) {
      return res.status(400).json({ success: false, message: 'Cannot delete default categories', data: null });
    }

    await CategoryLockStatus.findByIdAndDelete(doc._id);
    res.status(200).json({ success: true, message: 'Deleted successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

module.exports = { getAll, getOne, create, update, deleteOne, unlock, updateProgress, syncTotals, seedDefaultsForUser };
