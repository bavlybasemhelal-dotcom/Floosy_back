const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    /** Reference to the owner user */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /** Bill or subscription name */
    name: {
      type: String,
      required: [true, 'Bill name is required'],
      trim: true,
    },
    /** Computed due-date display string */
    dueDate: {
      type: String,
      default: '',
    },
    /** Bill amount */
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    /** Payment status: 0=upcoming, 1=paid, 2=overdue */
    status: {
      type: Number,
      enum: [0, 1, 2],
      default: 0,
    },
    /** Material icon code point */
    icon: {
      type: Number,
      default: 0,
    },
    /** Color integer value */
    color: {
      type: Number,
      default: 0xFF4CAF50,
    },
    /** Bill type (e.g. filter_monthly, filter_yearly) */
    type: {
      type: String,
      default: 'filter_monthly',
    },
    /** Actual due date */
    date: {
      type: Date,
      default: null,
    },
    /** Whether this is a recurring subscription */
    isSubscription: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

billSchema.index({ userId: 1, status: 1 });
billSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('Bill', billSchema);
