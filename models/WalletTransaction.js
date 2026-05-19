const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema(
  {
    /** Reference to the owner user */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /** Transaction title (e.g. Salary, Extra Income) */
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    /** Transaction amount */
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    /** Transaction date */
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    /** Whether this is an expense (true) or income (false) */
    isExpense: {
      type: Boolean,
      default: false,
    },
    /** Whether this is extra income vs salary/allowance */
    isExtra: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

walletTransactionSchema.index({ userId: 1, date: -1 });
walletTransactionSchema.index({ userId: 1, isExpense: 1 });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
