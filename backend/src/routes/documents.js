const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const { bankId } = req.query;
    let query = 'SELECT * FROM documents';
    const params = [];

    if (bankId) {
      // PostgreSQL string splitting instead of MySQL FIND_IN_SET
      query += ` WHERE (visibility = 'all' OR "bankId" = ? OR (? = ANY(string_to_array(COALESCE("assignedBanks", ''), ',')))) AND "isPublished" = true`;
      params.push(bankId, bankId);
    }

    query += ' ORDER BY position ASC, "createdAt" DESC';
    const [rows] = await db.query(query, params);

    res.json(rows); // PG naturally returns 1/0 as true/false for BOOLEAN types
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, bankId, title, subtitle, formCode, parentId, content, author, isVersion, position, visibility, assignedBanks, isPublished } = req.body;
    await db.query(
      `INSERT INTO documents (id, "bankId", title, subtitle, "formCode", "parentId", content, author, "isVersion", position, visibility, "assignedBanks", "isPublished") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, bankId, title, subtitle || '', formCode || null, parentId || null, content, author || 'System', isVersion ? true : false, position || 1, visibility || 'specific', assignedBanks || null, isPublished ? true : false]
    );

    // Activity Logging
    await db.logActivity(isVersion ? 'version_create' : 'document_create', `Created ${isVersion ? 'version' : 'document'} "${title}"`, bankId);

    res.status(201).json({ id });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, content, bankId, formCode, position, parentId, visibility, assignedBanks, isPublished } = req.body;
    let updates = []; let params = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (subtitle !== undefined) { updates.push('subtitle = ?'); params.push(subtitle); }
    if (content !== undefined) { updates.push('content = ?'); params.push(content); }
    if (bankId !== undefined) { updates.push('"bankId" = ?'); params.push(bankId); }
    if (formCode !== undefined) { updates.push('"formCode" = ?'); params.push(formCode); }
    if (position !== undefined) { updates.push('position = ?'); params.push(position); }
    if (parentId !== undefined) { updates.push('"parentId" = ?'); params.push(parentId === null ? null : parentId); }
    if (visibility !== undefined) { updates.push('visibility = ?'); params.push(visibility); }
    if (assignedBanks !== undefined) { updates.push('"assignedBanks" = ?'); params.push(assignedBanks); }
    if (isPublished !== undefined) { updates.push('"isPublished" = ?'); params.push(isPublished ? true : false); }

    if (updates.length > 0) {
      params.push(id);
      await db.query(`UPDATE documents SET ${updates.join(', ')} WHERE id = ?`, params);
      
      // Activity Logging
      if (title || content) {
        const [doc] = await db.query('SELECT title, "bankId" FROM documents WHERE id = ?', [id]);
        if (doc && doc[0]) {
           await db.logActivity('document_update', `Updated document "${title || doc[0].title}"`, doc[0].bankId);
        }
      }
    }
    res.json({ success: true });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT title, "bankId" FROM documents WHERE id = ?', [id]);
    
    await db.query('DELETE FROM documents WHERE id = ?', [id]);

    // Activity Logging
    if (rows && rows[0]) {
      await db.logActivity('document_delete', `Deleted document "${rows[0].title}"`, rows[0].bankId);
    }

    res.json({ success: true });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed' }); }
});

module.exports = router;
