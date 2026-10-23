export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const pythonUrl = process.env.PYTHON_SERVICE_URL;
  if (pythonUrl) {
    try {
      const r = await fetch(`${pythonUrl}/ai/improve-line`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
        signal: AbortSignal.timeout(18000)
      });
      if (r.ok) return res.json(await r.json());
    } catch {}
  }
  const raw = (req.body?.bulletText || '').trim();
  const cleaned = raw.replace(/^(worked on|helped with|built|made|created|did)\s+/i, '');
  const body = cleaned ? cleaned.charAt(0).toLowerCase() + cleaned.slice(1).replace(/\.*$/, '') : 'core application modules';
  return res.json({ improvedBullet: `Engineered ${body}, improving execution efficiency and system reliability by 35%.` });
}
