const buildCrudController = require('./crudFactory');
const SharedMember = require('../models/SharedMember');
const User = require('../models/User');
const Notification = require('../models/Notification');
const crud = buildCrudController(SharedMember);

/**
 * POST /api/shared-members
 * Create a new shared member invitation.
 * The invitation is scoped to the authenticated user (wallet owner).
 */
const createMember = async (req, res) => {
  console.log('--- Create Shared Member Request ---');
  console.log('User ID:', req.user.id);
  console.log('Body:', req.body);
  
  try {
    const body = { ...req.body, userId: req.user.id };
    const doc = await SharedMember.create(body);
    console.log('Member created successfully:', doc._id);

    // Send a notification to the invited user (if they exist)
    try {
      const invitedUser = await User.findOne({ email: body.contact?.toLowerCase() });
      if (invitedUser) {
        const ownerUser = await User.findById(req.user.id).select('name email');
        await Notification.create({
          userId: invitedUser._id,
          title: 'Shared Wallet Invitation',
          description: `${ownerUser?.name || 'Someone'} has invited you to join their shared wallet.`,
          type: 'invitation',
          metadata: {
            invitationId: doc._id.toString(),
            inviterUid: req.user.id,
            inviterName: ownerUser?.name || '',
            inviterEmail: ownerUser?.email || '',
          },
          icon: 0xe7fd, // people icon codepoint
          color: 0xFF4CAF50,
        });
      }
    } catch (notifError) {
      console.error('Warning: Could not create invitation notification:', notifError.message);
      // Don't fail the main operation if notification fails
    }

    res.status(201).json({ success: true, message: 'Created successfully', data: doc });
  } catch (error) {
    console.error('Error creating member:', error.message);
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * GET /api/shared-members/invitations
 * Get pending invitations for the current user (by email).
 */
const getInvitations = async (req, res) => {
  try {
    const invitations = await SharedMember.find({ 
      contact: req.user.email,
      status: 'pending' 
    }).populate('userId', 'name email profilePictureUrl');

    res.status(200).json({
      success: true,
      message: 'Invitations retrieved',
      data: { items: invitations }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * POST /api/shared-members/invitations/:id/accept
 * Accept a pending invitation.
 * Links the invited user to the wallet owner's shared member record.
 */
const acceptInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const invitation = await SharedMember.findOne({ 
      _id: id, 
      contact: req.user.email 
    });

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found', data: null });
    }

    if (invitation.status === 'accepted') {
      return res.status(400).json({ success: false, message: 'Invitation already accepted', data: null });
    }

    // Update the invitation status and link the invited user
    invitation.status = 'accepted';
    invitation.invitedUserId = req.user.id;
    invitation.joinedAt = new Date();

    // Update profile image from the accepting user's account
    const acceptingUser = await User.findById(req.user.id).select('name profilePictureUrl');
    if (acceptingUser) {
      if (acceptingUser.profilePictureUrl) {
        invitation.profileImage = acceptingUser.profilePictureUrl;
      }
      // Update the name to the actual user name
      invitation.name = acceptingUser.name || invitation.name;
    }

    await invitation.save();

    // Send a notification to the wallet owner
    try {
      const acceptorUser = await User.findById(req.user.id).select('name email');
      await Notification.create({
        userId: invitation.userId, // the wallet owner
        title: 'Invitation Accepted',
        description: `${acceptorUser?.name || 'A user'} has accepted your shared wallet invitation.`,
        type: 'invitation_accepted',
        metadata: {
          memberId: invitation._id.toString(),
          acceptedByUid: req.user.id,
          acceptedByName: acceptorUser?.name || '',
          acceptedByEmail: acceptorUser?.email || '',
        },
        icon: 0xe7fb, // person_add icon codepoint
        color: 0xFF4CAF50,
      });
    } catch (notifError) {
      console.error('Warning: Could not create acceptance notification:', notifError.message);
    }

    // Populate the owner info before returning
    await invitation.populate('userId', 'name email profilePictureUrl');

    res.status(200).json({
      success: true,
      message: 'Invitation accepted',
      data: invitation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * GET /api/shared-members
 * Get all shared members.
 * Returns members where the current user is the owner OR an accepted member.
 * This allows shared users to see the wallet's member list.
 */
const getAllMembers = async (req, res) => {
  try {
    const { page = 1, limit = 50, sortBy = 'createdAt', order = 'desc' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    // Find members where user is the owner
    const ownedQuery = { userId: req.user.id };

    // Find the wallet this user is linked to (as an accepted member)
    const linkedMembership = await SharedMember.findOne({
      invitedUserId: req.user.id,
      status: 'accepted',
    });

    let query;
    if (linkedMembership) {
      // User is a linked member — show the owner's shared members list
      query = { userId: linkedMembership.userId };
    } else {
      // User is the wallet owner — show their own members
      query = ownedQuery;
    }

    const [data, total] = await Promise.all([
      SharedMember.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit))
        .populate('invitedUserId', 'name email profilePictureUrl'),
      SharedMember.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: 'Data retrieved successfully',
      data: {
        items: data,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
        isLinked: !!linkedMembership,
        ownerId: linkedMembership ? linkedMembership.userId.toString() : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * DELETE /api/shared-members/:id
 * Remove a shared member. Only the wallet owner can remove members.
 */
const removeMember = async (req, res) => {
  try {
    const doc = await SharedMember.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Not found', data: null });
    }

    // Notify the removed user if they had accepted
    if (doc.invitedUserId) {
      try {
        const ownerUser = await User.findById(req.user.id).select('name');
        await Notification.create({
          userId: doc.invitedUserId,
          title: 'Removed from Shared Wallet',
          description: `${ownerUser?.name || 'The wallet owner'} has removed you from their shared wallet.`,
          type: 'member_removed',
          icon: 0xe7fe, // person_remove icon
          color: 0xFFFF5252,
        });
      } catch (notifError) {
        console.error('Warning: Could not create removal notification:', notifError.message);
      }
    }

    await SharedMember.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

module.exports = {
  ...crud,
  create: createMember,
  getAll: getAllMembers,
  deleteOne: removeMember,
  getInvitations,
  acceptInvitation,
};
