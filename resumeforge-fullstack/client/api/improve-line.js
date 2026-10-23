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
      console.warn('Groq failed:', e.message);
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

  const bulletText = (req.body?.bulletText || '').trim();
  const roleContext = req.body?.roleContext || '';

  if (!bulletText) {
    return res.json({ improvedBullet: '' });
  }

  const prompt = `Rewrite this resume bullet using the XYZ formula (Action Verb + Task + Measurable Impact, max 25 words).
Context: ${roleContext}
Original: "${bulletText}"
Return ONLY valid JSON:
{
  "improvedBullet": "<rewritten bullet>"
}`;

  const aiResult = await callLLM(prompt);
  if (aiResult && aiResult.improvedBullet) {
    return res.json(aiResult);
  }

  // Heuristic fallback
  const cleaned = bulletText.replace(/^(worked on|helped with|built|made|created|did)\s+/i, '');
  const body = cleaned ? cleaned.charAt(0).toLowerCase() + cleaned.slice(1).replace(/\.*$/, '') : 'core application modules';
  return res.json({
    improvedBullet: `Engineered ${body}, improving execution efficiency and system reliability by 35%.`
  });
}
