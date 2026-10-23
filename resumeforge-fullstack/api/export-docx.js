export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const pythonUrl = process.env.PYTHON_SERVICE_URL;
  if (pythonUrl) {
    try {
      const r = await fetch(`${pythonUrl}/ai/export-docx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      if (r.ok) {
        const buffer = Buffer.from(await r.arrayBuffer());
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename="ResumeForge.docx"');
        return res.send(buffer);
      }
    } catch {}
  }
  return res.status(503).json({ error: 'DOCX service unavailable. Please use PDF export.' });
}
