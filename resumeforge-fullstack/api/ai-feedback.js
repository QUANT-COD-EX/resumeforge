export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const pythonUrl = process.env.PYTHON_SERVICE_URL;
  if (pythonUrl) {
    try {
      const r = await fetch(`${pythonUrl}/ai/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
        signal: AbortSignal.timeout(18000)
      });
      if (r.ok) return res.json(await r.json());
    } catch {}
  }
  // Inline fallback
  const resumeData = req.body?.resumeData || {};
  const skills = resumeData?.skills?.technical || [];
  const hasNumbers = /\d+%|\d+x|\d+\+/.test(JSON.stringify(resumeData?.experience || []));
  const score = Math.min(9.4, 6.8 + (hasNumbers ? 1.4 : 0) + (skills.length >= 5 ? 0.8 : 0)).toFixed(1);
  return res.json({
    score: Number(score),
    strengths: ['Well-structured A4 hierarchy with clear chronological progression.', `Includes ${skills.length} relevant technical skills for ATS indexing.`],
    weaknesses: [hasNumbers ? 'Summary could highlight domain-specific architecture scale more explicitly.' : 'Experience and project bullets need concrete metrics (e.g., % latency reduction).'],
    improvements: ['Lead every bullet point with a high-impact past-tense verb (Architected, Engineered).', 'Run the Tailor to JD tool to inject exact role keywords prior to exporting PDF.']
  });
}
