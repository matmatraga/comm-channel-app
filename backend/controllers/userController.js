const User = require('../models/User');

exports.getUserDetails = async (req, res) => {
    try {
        const currentUserId = req.user.id; // Assumes `verifyToken` middleware is applied
        const users = await User.find({ _id: { $ne: currentUserId } }).select('-password -__v');
        res.status(200).json(users);
    } catch (error) {
        console.error('[GET USER DETAILS ERROR]', error);
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
};


exports.currentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -__v');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('[CURRENT USER ERROR]', error);
        res.status(500).json({ error: 'Failed to fetch current user' });
    }
}