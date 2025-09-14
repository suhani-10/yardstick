const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create note
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }

    // Check subscription limits
    if (req.user.subscription_plan === 'free') {
      const tenantResult = await pool.query(
        'SELECT notes_created_count, trial_used FROM tenants WHERE id = $1',
        [req.user.tenant_id]
      );
      
      const tenant = tenantResult.rows[0];
      
      if (tenant.notes_created_count >= 3) {
        return res.status(403).json({ 
          error: 'Free trial expired. You have used all 3 trial notes. Upgrade to Pro for unlimited notes.',
          trialExpired: true
        });
      }
    }

    const result = await pool.query(
      'INSERT INTO notes (title, content, tenant_id, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, req.user.tenant_id, req.user.id]
    );

    // Increment notes created count for free users
    if (req.user.subscription_plan === 'free') {
      await pool.query(
        'UPDATE tenants SET notes_created_count = notes_created_count + 1, trial_used = TRUE WHERE id = $1',
        [req.user.tenant_id]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get notes based on user role
router.get('/', async (req, res) => {
  try {
    let query, params;
    
    if (req.user.role === 'admin') {
      // Admin can see all notes in their tenant
      query = `
        SELECT n.*, u.email as created_by_email 
        FROM notes n 
        JOIN users u ON n.created_by = u.id 
        WHERE n.tenant_id = $1 
        ORDER BY n.created_at DESC
      `;
      params = [req.user.tenant_id];
    } else {
      // Regular users can only see their own notes
      query = `
        SELECT n.*, u.email as created_by_email 
        FROM notes n 
        JOIN users u ON n.created_by = u.id 
        WHERE n.tenant_id = $1 AND n.created_by = $2 
        ORDER BY n.created_at DESC
      `;
      params = [req.user.tenant_id, req.user.id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single note with role-based access
router.get('/:id', async (req, res) => {
  try {
    let query, params;
    
    if (req.user.role === 'admin') {
      // Admin can access any note in their tenant
      query = `
        SELECT n.*, u.email as created_by_email 
        FROM notes n 
        JOIN users u ON n.created_by = u.id 
        WHERE n.id = $1 AND n.tenant_id = $2
      `;
      params = [req.params.id, req.user.tenant_id];
    } else {
      // Regular users can only access their own notes
      query = `
        SELECT n.*, u.email as created_by_email 
        FROM notes n 
        JOIN users u ON n.created_by = u.id 
        WHERE n.id = $1 AND n.tenant_id = $2 AND n.created_by = $3
      `;
      params = [req.params.id, req.user.tenant_id, req.user.id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update note with role-based access
router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }

    let query, params;
    
    if (req.user.role === 'admin') {
      // Admin can update any note in their tenant
      query = 'UPDATE notes SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 AND tenant_id = $4 RETURNING *';
      params = [title, content, req.params.id, req.user.tenant_id];
    } else {
      // Regular users can only update their own notes
      query = 'UPDATE notes SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 AND tenant_id = $4 AND created_by = $5 RETURNING *';
      params = [title, content, req.params.id, req.user.tenant_id, req.user.id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found or access denied' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete note with role-based access
router.delete('/:id', async (req, res) => {
  try {
    let query, params;
    
    if (req.user.role === 'admin') {
      // Admin can delete any note in their tenant
      query = 'DELETE FROM notes WHERE id = $1 AND tenant_id = $2 RETURNING *';
      params = [req.params.id, req.user.tenant_id];
    } else {
      // Regular users can only delete their own notes
      query = 'DELETE FROM notes WHERE id = $1 AND tenant_id = $2 AND created_by = $3 RETURNING *';
      params = [req.params.id, req.user.tenant_id, req.user.id];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found or access denied' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;