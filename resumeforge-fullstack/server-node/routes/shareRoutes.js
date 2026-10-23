import express from 'express';
import { nanoid } from 'nanoid';
import { dbRun, dbGet } from '../db/init.js';

const router = express.Router();

router.post('/share-resume', async (req, res) => {
  try {
    const { resumeData } = req.body;
    if (!resumeData || typeof resumeData !== 'object') {
      return res.status(400).json({ error: 'Valid resumeData object is required.' });
    }

    const shareId = `rf_${nanoid(8)}`;
    const templateId = resumeData?.meta?.template || 'modern';
    await dbRun(
      `INSERT INTO shared_resumes (id, resume_data, template_id) VALUES (?, ?, ?)`,
      [shareId, JSON.stringify(resumeData), templateId]
    );

    const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
    return res.status(201).json({
      shareId,
      shareUrl: `${clientOrigin}/?share=${shareId}`
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save shared resume.' });
  }
});

router.get('/load-resume/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const row = await dbGet(
      `SELECT id, resume_data, template_id, created_at, views_count FROM shared_resumes WHERE id = ?`,
      [id]
    );
    if (!row) return res.status(404).json({ error: 'Shared resume not found.' });

    await dbRun(`UPDATE shared_resumes SET views_count = views_count + 1 WHERE id = ?`, [id]);

    return res.json({
      shareId: row.id,
      templateId: row.template_id,
      createdAt: row.created_at,
      viewsCount: row.views_count + 1,
      resumeData: JSON.parse(row.resume_data)
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load shared resume.' });
  }
});

export default router;
