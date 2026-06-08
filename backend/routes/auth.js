const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const matchmakers = require('../data/matchmakers.json');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const matchmaker = matchmakers.find(
    (m) => m.email === email && m.password === password
  );

  if (!matchmaker) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    {
      id: matchmaker.id,
      name: matchmaker.name,
      email: matchmaker.email,
      role: matchmaker.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    matchmaker: {
      id: matchmaker.id,
      name: matchmaker.name,
      email: matchmaker.email,
      role: matchmaker.role,
      profilePhoto: matchmaker.profilePhoto,
    },
  });
});

// POST /api/auth/verify
router.post('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ valid: false });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, matchmaker: decoded });
  } catch {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
