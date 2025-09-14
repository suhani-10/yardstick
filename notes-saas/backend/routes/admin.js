const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole('admin'));

// View all users in admin's tenant
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.email, u.role, u.created_at,
             COUNT(n.id) as notes_count
      FROM users u 
      LEFT JOIN notes n ON u.id = n.created_by
      WHERE u.tenant_id = $1
      GROUP BY u.id, u.email, u.role, u.created_at
      ORDER BY u.created_at DESC
    `, [req.user.tenant_id]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// View all notes in admin's tenant
router.get('/notes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT n.id, n.title, n.content, u.email as created_by_email, 
             n.created_at, n.updated_at
      FROM notes n
      JOIN users u ON n.created_by = u.id
      WHERE n.tenant_id = $1
      ORDER BY n.created_at DESC
    `, [req.user.tenant_id]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get tenant analytics
router.get('/analytics', async (req, res) => {
  try {
    const [usersResult, notesResult, recentActivityResult] = await Promise.all([
      // Total users count
      pool.query('SELECT COUNT(*) as total_users FROM users WHERE tenant_id = $1', [req.user.tenant_id]),
      
      // Total notes count
      pool.query('SELECT COUNT(*) as total_notes FROM notes WHERE tenant_id = $1', [req.user.tenant_id]),
      
      // Recent activity (last 7 days)
      pool.query(`
        SELECT DATE(created_at) as date, COUNT(*) as notes_created
        FROM notes 
        WHERE tenant_id = $1 AND created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `, [req.user.tenant_id])
    ]);

    res.json({
      totalUsers: parseInt(usersResult.rows[0].total_users),
      totalNotes: parseInt(notesResult.rows[0].total_notes),
      recentActivity: recentActivityResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new user (admin can create users for their tenant)
router.post('/users', async (req, res) => {
  try {
    const { email, password, role = 'member' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (!['member', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be member or admin' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, password, role, tenant_id) VALUES ($1, $2, $3, $4) RETURNING id, email, role, created_at',
      [email, hashedPassword, role, req.user.tenant_id]
    );

    console.log(`✅ ADMIN CREATE USER: ${email} (${role}) by admin: ${req.user.email}`);

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a user (admin can delete users from their tenant)
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // First delete all notes created by this user
    await pool.query('DELETE FROM notes WHERE created_by = $1 AND tenant_id = $2', [userId, req.user.tenant_id]);
    
    // Then delete the user
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 AND tenant_id = $2 RETURNING email',
      [userId, req.user.tenant_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`✅ ADMIN DELETE USER: ${result.rows[0].email} by admin: ${req.user.email}`);

    res.json({ message: 'User and their notes deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;