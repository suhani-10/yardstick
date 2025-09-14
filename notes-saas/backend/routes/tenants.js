const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Upgrade tenant subscription (Admin only)
router.post('/:slug/upgrade', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Verify admin belongs to this tenant
    if (req.user.slug !== slug) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(
      'UPDATE tenants SET subscription_plan = $1 WHERE slug = $2 RETURNING *',
      ['pro', slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    res.json({ message: 'Subscription upgraded to Pro', tenant: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;