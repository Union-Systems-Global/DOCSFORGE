const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const { bankId, admin } = req.query;
    let query = 'SELECT id, "bankId", title, subtitle, "activityCode", "parentId", author, "isVersion", "versionLabel", position, visibility, "assignedBanks", "isPublished", "createdAt", "updatedAt" FROM documents';
    const params = [];

    if (bankId) {
      // Client Portal View: Filter by bank and force isPublished = true
      query += ` WHERE (visibility = 'all' OR "bankId" = ? OR (? = ANY(string_to_array(COALESCE("assignedBanks", ''), ',')))) AND "isPublished" = true`;
      params.push(bankId, bankId);
    } else if (admin !== 'true') {
      // Default / Public View (if not admin): Only show published
      query += ' WHERE "isPublished" = true';
    }

    query += ' ORDER BY position ASC, "createdAt" DESC';
    const [rows] = await db.query(query, params);

    res.json(rows); // PG naturally returns 1/0 as true/false for BOOLEAN types
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed' });
  }
});

router.get('/resolve-activity/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { bankId } = req.query;

    // 1. Search for main activityCode
    let queryMain = 'SELECT id, "bankId", title, "activityCode" FROM documents WHERE LOWER("activityCode") = LOWER(?)';
    let paramsMain = [code];
    if (bankId) {
      queryMain += ' AND (visibility = \'all\' OR "bankId" = ? OR ? = ANY(string_to_array(COALESCE("assignedBanks", \'\'), \',\')))';
      paramsMain.push(bankId, bankId);
    }
    const [mainMatch] = await db.query(queryMain, paramsMain);
    if (mainMatch && mainMatch[0]) {
      return res.json({ docId: mainMatch[0].id, type: 'main' });
    }

    // 2. Search for sub-activity code in content
    let querySub = 'SELECT id, "bankId", title, "activityCode" FROM documents WHERE content ILIKE ?';
    let paramsSub = [`%(${code})%`];
    if (bankId) {
      querySub += ' AND (visibility = \'all\' OR "bankId" = ? OR ? = ANY(string_to_array(COALESCE("assignedBanks", \'\'), \',\')))';
      paramsSub.push(bankId, bankId);
    }
    const [subMatch] = await db.query(querySub, paramsSub);
    if (subMatch && subMatch[0]) {
      return res.json({ docId: subMatch[0].id, type: 'sub' });
    }

    res.status(404).json({ error: 'Activity code not found' });
  } catch (error) {
    console.error('Resolve activity code error:', error);
    res.status(500).json({ error: 'Failed to resolve activity code' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM documents WHERE id = ?', [req.params.id]);
    if (rows && rows[0]) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, bankId, title, subtitle, activityCode, parentId, content, author, isVersion, versionLabel, position, visibility, assignedBanks, isPublished } = req.body;
    await db.query(
      `INSERT INTO documents (id, "bankId", title, subtitle, "activityCode", "parentId", content, author, "isVersion", "versionLabel", position, visibility, "assignedBanks", "isPublished") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, bankId, title, subtitle || '', activityCode || null, parentId || null, content, author || 'System', isVersion ? true : false, versionLabel || null, position || 1, visibility || 'specific', assignedBanks || null, isPublished ? true : false]
    );

    // Activity Logging
    await db.logActivity(isVersion ? 'version_create' : 'document_create', `Created ${isVersion ? 'version' : 'document'} "${title}"`, bankId);

    res.status(201).json({ id });
  } catch (error) { console.error(error); res.status(500).json({ error: 'Failed' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, content, bankId, activityCode, position, parentId, visibility, assignedBanks, isPublished, versionLabel } = req.body;
    let updates = []; let params = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (subtitle !== undefined) { updates.push('subtitle = ?'); params.push(subtitle); }
    if (content !== undefined) { updates.push('content = ?'); params.push(content); }
    if (bankId !== undefined) { updates.push('"bankId" = ?'); params.push(bankId); }
    if (activityCode !== undefined) { updates.push('"activityCode" = ?'); params.push(activityCode); }
    if (position !== undefined) { updates.push('position = ?'); params.push(position); }
    if (parentId !== undefined) { updates.push('"parentId" = ?'); params.push(parentId === null ? null : parentId); }
    if (versionLabel !== undefined) { updates.push('"versionLabel" = ?'); params.push(versionLabel === null ? null : versionLabel); }
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
