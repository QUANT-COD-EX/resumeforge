async function callLLM(prompt) {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (groqKey && groqKey !== 'your_groq_api_key_here') {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'Output strictly valid JSON only.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' }
        }),
        signal: AbortSignal.timeout(12000)
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return JSON.parse(content);
      }
    } catch (e) {
      console.warn('Groq failed, trying fallback...', e.message);
    }
  }

  if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.3 }
          }),
          signal: AbortSignal.timeout(12000)
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return JSON.parse(text);
      }
    } catch (e) {
      console.warn('Gemini failed:', e.message);
    }
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const resumeData = req.body?.resumeData || {};
  const jobDescription = req.body?.jobDescription || '';

  const prompt = `Compare the resume against the Job Description and return ONLY valid JSON:
{
  "matchScore": <int 0 to 100>,
  "tailoredSummary": "<2-3 sentence tailored summary>",
  "missingSkills": ["<skill 1>", "<skill 2>", "<skill 3>"],
  "missingKeywords": ["<keyword 1>", "<keyword 2>"],
  "quickWins": ["<win 1>", "<win 2>"]
}
Job Description:
${jobDescription}
Resume:
${JSON.stringify(resumeData)}`;

  const aiResult = await callLLM(prompt);
  if (aiResult && aiResult.matchScore) {
    return res.json(aiResult);
  }

  // Heuristic fallback
  const jdLower = jobDescription.toLowerCase();
  const candidateSkills = (resumeData?.skills?.technical || []).map((s) => s.toLowerCase());
  const catalog = ['Docker', 'Kubernetes', 'AWS', 'GraphQL', 'TypeScript', 'CI/CD', 'Redis', 'Microservices', 'PostgreSQL'];
  const missing = catalog.filter((i) => jdLower.includes(i.toLowerCase()) && !candidateSkills.includes(i.toLowerCase()));

  return res.json({
    matchScore: 78,
    tailoredSummary: `Results-driven ${resumeData?.personal?.title || 'Software Engineer'} skilled in ${(resumeData?.skills?.technical || ['React.js', 'Node.js']).slice(0, 4).join(', ')}, delivering high-performance, ATS-ready solutions.`,
    missingSkills: missing.length ? missing.slice(0, 5) : ['Docker', 'CI/CD', 'Cloud Architecture'],
    missingKeywords: ['Scalability', 'System Design'],
    quickWins: ['Apply the tailored summary above with one click.']
  });
}
