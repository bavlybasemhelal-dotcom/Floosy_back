const SharedMember = require('../models/SharedMember');

/**
 * Resolve the effective wallet owner ID for shared-wallet operations.
 *
 * If the requesting user is a linked shared-member (accepted invitation),
 * returns the primary wallet owner's ID so that all data operations
 * are scoped to the owner's data set.
 *
 * Otherwise, returns the requesting user's own ID.
 *
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<string>} The effective owner ID
 */
const resolveWalletOwner = async (userId) => {
  const linkedMembership = await SharedMember.findOne({
    invitedUserId: userId,
    status: 'accepted',
  });
  return linkedMembership ? linkedMembership.userId.toString() : userId;
};

module.exports = { resolveWalletOwner };
