const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    /** Reference to the owner user */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /** Base amount converted to home currency */
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    /** Original amount in the currency it was spent */
    originalAmount: {
      type: Number,
      default: 0,
    },
    /** Original currency code (e.g. USD, EGP) */
    originalCurrency: {
      type: String,
      default: 'USD',
    },
    /** Exchange rate used at entry time (base / original) */
    exchangeRate: {
      type: Number,
      default: 1.0,
    },
    /** Expense category name */
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    /** Date of the transaction */
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    /** Description or notes */
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
