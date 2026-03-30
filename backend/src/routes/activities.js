const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET all activities
router.get('/', async (req, res) => {
  try {
    const [rows] = await query('SELECT * FROM activities ORDER BY "createdAt" DESC LIMIT 50');
    res.json(rows);
  } catch (error) {
    console.error('Fetch activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// GET workspace stats for dashboard
router.get('/stats', async (req, res) => {
  try {
    const [docsCount] = await query('SELECT COUNT(*) FROM documents');
    const [portalsCount] = await query('SELECT COUNT(*) FROM portals');
    const [recentUpdates] = await query('SELECT COUNT(*) FROM activities WHERE "createdAt" >= NOW() - INTERVAL \'24 hours\'');
    
    res.json({
      totalDocuments: parseInt(docsCount[0].count),
      totalPortals: parseInt(portalsCount[0].count),
      recentActivityCount: parseInt(recentUpdates[0].count),
      activeContributors: 1 // Default for now
    });
  } catch (error) {
    console.error('Fetch stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// POST a new activity (Internal/Manual use)
router.post('/', async (req, res) => {
  const { type, message, bankId, user_name } = req.body;
  try {
    const [rows] = await query(
      'INSERT INTO activities (type, message, "bankId", user_name) VALUES ($1, $2, $3, $4) RETURNING *',
      [type, message, bankId || null, user_name || 'System Admin']
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Log activity error:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

module.exports = router;
