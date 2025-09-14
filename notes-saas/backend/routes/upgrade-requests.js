const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// Create upgrade request
router.post('/', async (req, res) => {
  try {
    // Check if user already has pending request
    const existing = await pool.query(
      'SELECT id FROM upgrade_requests WHERE user_id = $1 AND status = $2',
      [req.user.id, 'pending']
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You already have a pending upgrade request' });
    }

    const result = await pool.query(
      'INSERT INTO upgrade_requests (user_id, tenant_id, status) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, req.user.tenant_id, 'pending']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's upgrade request status
router.get('/status', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM upgrade_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.user.id]
    );

    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Get all upgrade requests for tenant
router.get('/admin', requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ur.*, u.email as user_email 
      FROM upgrade_requests ur 
      JOIN users u ON ur.user_id = u.id 
      WHERE ur.tenant_id = $1 
      ORDER BY ur.created_at DESC
    `, [req.user.tenant_id]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Approve/Reject upgrade request
router.put('/admin/:id', requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE upgrade_requests SET status = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3 RETURNING *',
      [status, req.params.id, req.user.tenant_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // If approved, upgrade the tenant to pro
    if (status === 'approved') {
      await pool.query(
        'UPDATE tenants SET subscription_plan = $1 WHERE id = $2',
        ['pro', req.user.tenant_id]
      );
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;