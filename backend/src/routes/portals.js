const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM portals ORDER BY "createdAt" DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

router.post('/', async (req, res) => {
  try {
    const { id, name, type, bankCode, logoUrl } = req.body;
    await db.query(`INSERT INTO portals (id, name, type, "bankCode", "logoUrl") VALUES (?, ?, ?, ?, ?)`, [id, name, type, bankCode || null, logoUrl || null]);
    const [newPortal] = await db.query('SELECT * FROM portals WHERE id = ?', [id]);

    // Activity Logging
    await db.logActivity('portal_create', `Created new ${type} portal: "${name}"`, id);

    res.status(201).json(newPortal[0]);
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, bankCode, logoUrl } = req.body;
    await db.query(`UPDATE portals SET name = ?, "bankCode" = ?, "logoUrl" = ? WHERE id = ?`, [name, bankCode || null, logoUrl || null, id]);

    // Activity Logging
    await db.logActivity('portal_update', `Updated portal settings for "${name}"`, id);

    res.json({ success: true });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM portals WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

module.exports = router;
