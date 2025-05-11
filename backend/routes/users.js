const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const auth = require('../middleware/auth');

const router = express.Router();

// Get events the user is registered for
router.get('/registrations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('registrations');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.registrations);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 