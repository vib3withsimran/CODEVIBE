const UserModel = require('../../models/user.models');
const { validatePassword } = require('../../utils/passwordValidator');

const updateProfile = async (req, res) => {
  try {
    const tokenEmail = req.user?.email;
    if (!tokenEmail) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const errors = [];

    if (req.body.username !== undefined) {
      const username = req.body.username?.trim();
      if (!username || username.length < 2) {
        errors.push('Username must be at least 2 characters long');
      } else if (username.length > 50) {
        errors.push('Username must not exceed 50 characters');
      } else if (!/^[a-zA-Z0-9_\s]+$/.test(username)) {
        errors.push('Username can only contain letters, numbers, spaces and underscores');
      } else {
        req.body.username = username;
      }
    }

    if (req.body.college !== undefined) {
      const college = req.body.college?.trim();
      if (!college || college.length < 2) {
        errors.push('College name must be at least 2 characters long');
      } else if (college.length > 100) {
        errors.push('College name must not exceed 100 characters');
      } else {
        req.body.college = college;
      }
    }

    if (req.body.year !== undefined) {
      const validYears = ['1', '2', '3', '4', '1st year', '2nd year', '3rd year', '4th year'];
      if (!validYears.includes(req.body.year?.trim())) {
        errors.push('Year must be a valid academic year (1, 2, 3, or 4)');
      }
    }

    if (req.body.bio !== undefined && req.body.bio.length > 500) {
      errors.push('Bio must not exceed 500 characters');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const updateFields = {};
    const allowedFields = ['username', 'college', 'year', 'bio', 'avatarUrl'];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'No profile fields to update' });
    }

    const user = await UserModel.findOneAndUpdate(
      { email: tokenEmail },
      { $set: updateFields },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        college: user.college,
        year: user.year,
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || '',
        joinedAt:
          user.joinedAt ||
          (user._id && typeof user._id.getTimestamp === 'function'
            ? user._id.getTimestamp()
            : null),
      },
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = updateProfile;