const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    /** Reference to the owner user */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    /** Base salary / allowance amount */
    allowance: {
      type: Number,
      default: 0,
    },
    /** Total extra income amount */
    extraIncome: {
      type: Number,
      default: 0,
    },
    /** Total spent amount (synced from expenses) */
    totalSpent: {
      type: Number,
      default: 0,
    },
    /** Wallet home currency code */
    walletCurrency: {
      type: String,
      default: 'EGP',
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model('Wallet', walletSchema);
