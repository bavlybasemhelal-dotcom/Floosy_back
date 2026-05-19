const mongoose = require('mongoose');

const sharedMemberSchema = new mongoose.Schema(
  {
    /** The wallet owner who sent the invitation */
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    /** The actual User account of the invited member (set on accept) */
    invitedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: [true, 'Name is required'], trim: true },
    contact: { type: String, required: [true, 'Contact is required'], trim: true },
    relationship: { type: Number, enum: [0, 1, 2, 3, 4], required: true },
    role: { type: Number, enum: [0, 1, 2], default: 1 },
    profileImage: { type: String, default: null },
    joinedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
  },
  { timestamps: true }
);

sharedMemberSchema.index({ userId: 1, status: 1 });
sharedMemberSchema.index({ contact: 1, status: 1 });
sharedMemberSchema.index({ invitedUserId: 1 });
module.exports = mongoose.model('SharedMember', sharedMemberSchema);
