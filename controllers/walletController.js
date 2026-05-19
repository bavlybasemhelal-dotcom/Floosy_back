const buildSharedCrudController = require('./sharedCrudFactory');
const WalletTransaction = require('../models/WalletTransaction');
const Wallet = require('../models/Wallet');
const { resolveWalletOwner } = require('../middleware/resolveOwner');

const crud = buildSharedCrudController(WalletTransaction);

/**
 * GET /api/wallet/summary
 * Retrieve the wallet summary. Shared members see the owner's wallet.
 */
const getWallet = async (req, res) => {
  try {
    const effectiveOwner = await resolveWalletOwner(req.user.id);
    let wallet = await Wallet.findOne({ userId: effectiveOwner });
    if (!wallet) wallet = await Wallet.create({ userId: effectiveOwner });
    res.status(200).json({ success: true, message: 'Wallet retrieved', data: wallet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * PUT /api/wallet/summary
 * Update the wallet summary. Shared members update the owner's wallet.
 */
const updateWallet = async (req, res) => {
  try {
    const effectiveOwner = await resolveWalletOwner(req.user.id);
    const wallet = await Wallet.findOneAndUpdate(
      { userId: effectiveOwner },
      req.body,
      { new: true, runValidators: true, upsert: true }
    );
    res.status(200).json({ success: true, message: 'Wallet updated', data: wallet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

module.exports = { ...crud, getWallet, updateWallet };
