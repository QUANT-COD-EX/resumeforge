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

  const prompt = `You are a strict technical recruiter. Analyze this resume JSON and return ONLY valid JSON:
{
  "score": <float 1.0 to 10.0>,
  "strengths": ["<point 1>", "<point 2>"],
  "weaknesses": ["<point 1>", "<point 2>"],
  "improvements": ["<fix 1>", "<fix 2>", "<fix 3>"]
}
Resume JSON:
${JSON.stringify(resumeData)}`;

  const aiResult = await callLLM(prompt);
  if (aiResult && aiResult.score) {
    return res.json(aiResult);
  }

  // Heuristic fallback
  const skills = resumeData?.skills?.technical || [];
  const hasNumbers = /\d+%|\d+x|\d+\+/.test(JSON.stringify(resumeData?.experience || []));
  const score = Math.min(9.4, 6.8 + (hasNumbers ? 1.4 : 0) + (skills.length >= 5 ? 0.8 : 0)).toFixed(1);

  return res.json({
    score: Number(score),
    strengths: [
      'Well-structured A4 hierarchy with clear chronological progression.',
      `Includes ${skills.length} relevant technical skills for ATS indexing.`
    ],
    weaknesses: [
      hasNumbers
        ? 'Summary could highlight domain-specific architecture scale more explicitly.'
        : 'Experience and project bullets need concrete metrics (e.g., % latency reduction).'
    ],
    improvements: [
      'Lead every bullet point with a high-impact past-tense verb (Architected, Engineered).',
      'Run the Tailor to JD tool to inject exact role keywords prior to exporting PDF.'
    ]
  });
}
