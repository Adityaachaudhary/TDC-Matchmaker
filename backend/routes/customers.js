const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const profiles = require('../data/profiles.json');

// GET /api/customers — all customers for logged-in matchmaker
router.get('/', authMiddleware, (req, res) => {
  const { id } = req.matchmaker;
  const customers = profiles.filter((p) => p.assignedMatchmaker === id);
  res.json({ customers, total: customers.length });
});

// GET /api/customers/:customerId — single customer full profile
router.get('/:customerId', authMiddleware, (req, res) => {
  const { customerId } = req.params;
  const { id } = req.matchmaker;

  const customer = profiles.find(
    (p) => p.id === customerId && p.assignedMatchmaker === id
  );

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  res.json({ customer });
});

// PATCH /api/customers/:customerId/status — update status tag
router.patch('/:customerId/status', authMiddleware, (req, res) => {
  const { customerId } = req.params;
  const { status } = req.body;
  const { id } = req.matchmaker;

  const validStatuses = ['active', 'on_hold', 'matched', 'paused'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  const customer = profiles.find(
    (p) => p.id === customerId && p.assignedMatchmaker === id
  );

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  // In a real DB we'd persist; for JSON we return updated object
  const updated = { ...customer, status };
  res.json({ customer: updated, message: 'Status updated' });
});

module.exports = router;
