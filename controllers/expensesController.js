const Expense = require('../models/Expense');
const CategoryLockStatus = require('../models/CategoryLockStatus');
const { resolveWalletOwner } = require('../middleware/resolveOwner');

// ── Helper: recalculate category totals from expenses ────────────────
/**
 * Recalculates totalSpent and transactionCount for a specific category
 * from the actual expense records. This is the safest approach — it avoids
 * drift that can happen with incremental updates.
 *
 * @param {string} userId     - The effective wallet owner ID
 * @param {string} categoryName - The category to recalculate
 */
async function _syncCategoryTotals(userId, categoryName) {
  if (!categoryName) return;

  const pipeline = [
    { $match: { userId: userId.toString ? userId : userId, category: categoryName } },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$amount' },
        transactionCount: { $sum: 1 },
      },
    },
  ];

  // We need to match by the ObjectId or string depending on how it's stored
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

  // Update the matching CategoryLockStatus (if it exists)
  await CategoryLockStatus.findOneAndUpdate(
    { userId, name: categoryName },
    {
      $set: {
        totalSpent: Math.round(totals.totalSpent * 100) / 100, // round to 2 decimals
        transactionCount: totals.transactionCount,
      },
    },
    { upsert: false } // don't create if it doesn't exist
  );

  // Also update progress towards unlocking (transactionCount serves as progress)
  const catLock = await CategoryLockStatus.findOne({ userId, name: categoryName });
  if (catLock && !catLock.isUnlocked && catLock.target > 0) {
    catLock.currentProgress = totals.transactionCount;
    if (catLock.currentProgress >= catLock.target) {
      catLock.isUnlocked = true;
    }
    await catLock.save();
  }
}

/**
 * Sync totals for ALL categories of a user (used after bulk operations).
 */
async function _syncAllCategoryTotals(userId) {
  const categories = await CategoryLockStatus.find({ userId }).select('name');
  for (const cat of categories) {
    await _syncCategoryTotals(userId, cat.name);
  }
}

// ── CRUD Endpoints ─────────────────────────────────────────────────

/**
 * GET /api/expenses
 * List all expenses for the user.
 */
const getAll = async (req, res) => {
  try {
    const effectiveOwner = await resolveWalletOwner(req.user.id);
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', from, to, ...filters } = req.query;

    const query = { userId: effectiveOwner };

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
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      Expense.find(query).sort({ [sortBy]: sortOrder }).skip(skip).limit(Number(limit)),
      Expense.countDocuments(query),
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
 * GET /api/expenses/:id
 */
const getOne = async (req, res) => {
  try {
    const effectiveOwner = await resolveWalletOwner(req.user.id);
    const doc = await Expense.findOne({ _id: req.params.id, userId: effectiveOwner });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });
    res.status(200).json({ success: true, message: 'Data retrieved successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * POST /api/expenses
 * Create a new expense and sync category totals.
 */
const create = async (req, res) => {
  try {
    const effectiveOwner = await resolveWalletOwner(req.user.id);
    const body = { ...req.body, userId: effectiveOwner };
    const doc = await Expense.create(body);

    // Sync totals for the category this expense belongs to
    await _syncCategoryTotals(effectiveOwner, doc.category);

    res.status(201).json({ success: true, message: 'Created successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * PUT /api/expenses/:id
 * Update an expense and sync category totals for both old and new category.
 */
const update = async (req, res) => {
  try {
    const effectiveOwner = await resolveWalletOwner(req.user.id);

    // Get the old document to know the previous category
    const oldDoc = await Expense.findOne({ _id: req.params.id, userId: effectiveOwner });
    if (!oldDoc) return res.status(404).json({ success: false, message: 'Not found', data: null });

    const oldCategory = oldDoc.category;

    const doc = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: effectiveOwner },
      req.body,
      { new: true, runValidators: true }
    );

    // Sync the old category (in case the expense moved to a different category)
    await _syncCategoryTotals(effectiveOwner, oldCategory);

    // If the category changed, also sync the new one
    if (doc.category !== oldCategory) {
      await _syncCategoryTotals(effectiveOwner, doc.category);
    }

    res.status(200).json({ success: true, message: 'Updated successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * DELETE /api/expenses/:id
 * Delete an expense and sync category totals.
 */
const deleteOne = async (req, res) => {
  try {
    const effectiveOwner = await resolveWalletOwner(req.user.id);
    const doc = await Expense.findOneAndDelete({ _id: req.params.id, userId: effectiveOwner });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });

    // Sync totals for the category that lost this expense
    await _syncCategoryTotals(effectiveOwner, doc.category);

    res.status(200).json({ success: true, message: 'Deleted successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

module.exports = { getAll, getOne, create, update, deleteOne };
