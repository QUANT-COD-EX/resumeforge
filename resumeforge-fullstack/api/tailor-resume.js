export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const pythonUrl = process.env.PYTHON_SERVICE_URL;
  if (pythonUrl) {
    try {
      const r = await fetch(`${pythonUrl}/ai/tailor-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
        signal: AbortSignal.timeout(18000)
      });
      if (r.ok) return res.json(await r.json());
    } catch {}
  }
  const resumeData = req.body?.resumeData || {};
  const jobDescription = (req.body?.jobDescription || '').toLowerCase();
  const candidateSkills = (resumeData?.skills?.technical || []).map((s) => s.toLowerCase());
  const catalog = ['Docker', 'Kubernetes', 'AWS', 'GraphQL', 'TypeScript', 'CI/CD', 'Redis', 'Microservices'];
  const missing = catalog.filter((i) => jobDescription.includes(i.toLowerCase()) && !candidateSkills.includes(i.toLowerCase()));
  return res.json({
    matchScore: 78,
    tailoredSummary: `Results-driven ${resumeData?.personal?.title || 'Software Engineer'} skilled in ${(resumeData?.skills?.technical || ['React.js', 'Python']).slice(0, 4).join(', ')}, delivering high-performance, ATS-ready full-stack solutions.`,
    missingSkills: missing.length ? missing.slice(0, 5) : ['Docker', 'CI/CD', 'Cloud Deployment'],
    missingKeywords: ['Scalability', 'Distributed Systems'],
    quickWins: ['Apply the tailored summary above with one click.']
  });
}
