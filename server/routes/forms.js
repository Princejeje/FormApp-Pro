const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(authenticateToken);

// Get all forms for logged in user
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, title, description, fields, created_at FROM forms WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single form
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM forms WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (rows.length === 0) return res.status(404).json({ message: 'Form not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create form
router.post('/', async (req, res) => {
  const { title, description, fields } = req.body;
  
  try {
    const { rows } = await db.query(
      'INSERT INTO forms (user_id, title, description, fields) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, title, description || '', JSON.stringify(fields || [])]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update form
router.put('/:id', async (req, res) => {
  const { title, description, fields } = req.body;
  
  try {
    // Verify ownership first
    const check = await db.query('SELECT id FROM forms WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (check.rows.length === 0) return res.status(404).json({ message: 'Form not found' });

    const { rows } = await db.query(
      'UPDATE forms SET title = $1, description = $2, fields = $3 WHERE id = $4 RETURNING *',
      [title, description, JSON.stringify(fields), req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete form
router.delete('/:id', async (req, res) => {
  try {
    // Verify ownership
    const check = await db.query('SELECT id FROM forms WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (check.rows.length === 0) return res.status(404).json({ message: 'Form not found' });

    // Note: In a real app with Foreign Keys, you might need to delete submissions first 
    // or use CASCADE in your SQL Schema.
    await db.query('DELETE FROM submissions WHERE form_id = $1', [req.params.id]);
    await db.query('DELETE FROM forms WHERE id = $1', [req.params.id]);
    
    res.json({ message: 'Form deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;