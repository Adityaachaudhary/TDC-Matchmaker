const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const profiles = require('../data/profiles.json');
const { findMatches } = require('../engine/matchLogic');

// GET /api/matches/:customerId
router.get('/:customerId', authMiddleware, (req, res) => {
  const { customerId } = req.params;
  const { id } = req.matchmaker;

  const client = profiles.find(
    (p) => p.id === customerId && p.assignedMatchmaker === id
  );

  if (!client) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const matches = findMatches(client, profiles);

  res.json({
    client: {
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      gender: client.gender,
    },
    matches,
    total: matches.length,
  });
});

module.exports = router;
