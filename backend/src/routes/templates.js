const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET all templates (predefined + custom)
router.get('/', async (req, res) => {
  try {
    const [rows] = await query('SELECT * FROM templates ORDER BY "createdAt" DESC');
    res.json(rows);
  } catch (error) {
    console.error('Fetch templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// POST a new template
router.post('/', async (req, res) => {
  const { id, name, description, category, content, sections } = req.body;
  try {
    const [rows] = await query(
      'INSERT INTO templates (id, name, description, category, content, sections) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, name, description, category || 'General', content, JSON.stringify(sections || [])]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Save template error:', error);
    res.status(500).json({ error: 'Failed to save template' });
  }
});

// DELETE a template
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query('DELETE FROM templates WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

module.exports = router;
