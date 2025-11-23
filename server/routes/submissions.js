const express = require('express');
const db = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// --- PUBLIC ROUTE ---

// Submit data (No Auth required)
router.post('/forms/:id/submit', async (req, res) => {
  const { data } = req.body;
  const formId = req.params.id;
  
  try {
    // Optional: Check if form exists
    const formCheck = await db.query('SELECT id FROM forms WHERE id = $1', [formId]);
    if (formCheck.rows.length === 0) return res.status(404).json({ message: 'Form not found' });

    await db.query(
      'INSERT INTO submissions (form_id, data) VALUES ($1, $2)',
      [formId, JSON.stringify(data)]
    );
    res.status(201).json({ message: 'Submission successful' });
  } catch (err) {
    res.status(500).json({ message: 'Submission failed' });
  }
});

// Get Public Form Metadata (No Auth required)
// This is needed for the PublicForm.tsx to render without login
router.get('/public/forms/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, title, description, fields FROM forms WHERE id = $1',
      [req.params.id]
    );
    
    if (rows.length === 0) return res.status(404).json({ message: 'Form not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// --- PROTECTED ROUTES ---

// Get submissions for a specific form (Owner only)
router.get('/forms/:id/submissions', authenticateToken, async (req, res) => {
  try {
    // Security check: Ensure the user requesting submissions actually owns the form
    const formCheck = await db.query('SELECT id FROM forms WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    
    if (formCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized access to these submissions' });
    }

    const { rows } = await db.query(
      'SELECT * FROM submissions WHERE form_id = $1 ORDER BY submitted_at DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;