const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Hardcoded admin credentials
const ADMIN_EMAIL = 'admin@saarang.com';
const ADMIN_PASSWORD_HASH = '$2b$10$qL/58Kywa.KmzPS8.mljnOsssVAp6ZX/o4SSJXY9Oe6pFxo7/j5Ii'; // bcrypt hash for 'Admin123'

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (email !== ADMIN_EMAIL) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }
  const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }
  const token = jwt.sign({ email, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

module.exports = router; 