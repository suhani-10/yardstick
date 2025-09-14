const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, tenantSlug } = req.body;

    if (!email || !password || !tenantSlug) {
      return res.status(400).json({ error: 'Email, password, and tenant required' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Get tenant ID
    const tenantResult = await pool.query('SELECT id FROM tenants WHERE slug = $1', [tenantSlug]);
    if (tenantResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid tenant' });
    }

    const tenantId = tenantResult.rows[0].id;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user as member
    const result = await pool.query(
      'INSERT INTO users (email, password, role, tenant_id) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
      [email, hashedPassword, 'member', tenantId]
    );

    console.log(`✅ SIGNUP: ${email} (member) for tenant: ${tenantSlug}`);

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await pool.query(`
      SELECT u.id, u.email, u.password, u.role, u.tenant_id, t.slug, t.subscription_plan, t.notes_created_count, t.trial_used 
      FROM users u 
      JOIN tenants t ON u.tenant_id = t.id 
      WHERE u.email = $1
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenant_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log successful login
    console.log(`✅ LOGIN: ${user.email} (${user.role}) from tenant: ${user.slug}`);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenant: {
          id: user.tenant_id,
          slug: user.slug,
          subscription_plan: user.subscription_plan,
          notes_created_count: user.notes_created_count,
          trial_used: user.trial_used
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get available tenants for signup
router.get('/tenants', async (req, res) => {
  try {
    const result = await pool.query('SELECT slug, name FROM tenants ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create admin user for a tenant
router.post('/create-admin', async (req, res) => {
  try {
    const { email, password, tenantSlug } = req.body;

    if (!email || !password || !tenantSlug) {
      return res.status(400).json({ error: 'Email, password, and tenant required' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Get tenant ID
    const tenantResult = await pool.query('SELECT id FROM tenants WHERE slug = $1', [tenantSlug]);
    if (tenantResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid tenant' });
    }

    const tenantId = tenantResult.rows[0].id;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    const result = await pool.query(
      'INSERT INTO users (email, password, role, tenant_id) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
      [email, hashedPassword, 'admin', tenantId]
    );

    console.log(`✅ ADMIN SIGNUP: ${email} (admin) for tenant: ${tenantSlug}`);

    res.status(201).json({
      message: 'Admin user created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;