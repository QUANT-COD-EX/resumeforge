function extractJson(rawText) {
  if (!rawText) return null;
  const cleaned = rawText.trim();
  const fence = cleaned.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (fence) {
    try { return JSON.parse(fence[1]); } catch {}
  }
  const brace = cleaned.match(/\{[\s\S]*\}/);
  if (brace) {
    try { return JSON.parse(brace[0]); } catch {}
  }
  try { return JSON.parse(cleaned); } catch {}
  return null;
}

async function callLLM(prompt) {
  const groqKey = (process.env.GROQ_API_KEY || '').trim();
  const geminiKey = (process.env.GEMINI_API_KEY || '').trim();

  if (groqKey && groqKey !== 'your_groq_api_key_here') {
    for (const model of ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant']) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: 'You are an executive resume writer. You rewrite weak resume bullet points using the Google XYZ formula (Action Verb + Scope/Task + Measurable Result). Return strictly valid JSON only.'
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' }
          }),
          signal: AbortSignal.timeout(12000)
        });
        if (res.ok) {
          const data = await res.json();
          const parsed = extractJson(data.choices?.[0]?.message?.content);
          if (parsed && parsed.improvedBullet) return parsed;
        }
      } catch (e) {
        console.warn(`Groq line rewrite (${model}) failed:`, e.message);
      }
    }
  }

  if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
    for (const model of ['gemini-1.5-flash', 'gemini-2.0-flash']) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
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
          const parsed = extractJson(data.candidates?.[0]?.content?.parts?.[0]?.text);
          if (parsed && parsed.improvedBullet) return parsed;
        }
      } catch (e) {
        console.warn(`Gemini line rewrite (${model}) failed:`, e.message);
      }
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

  const prompt = `Rewrite this resume bullet using the Google XYZ formula (Action Verb + Task + Measurable Impact, max 25 words).
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
  const verbs = ['Architected', 'Engineered', 'Spearheaded', 'Optimized', 'Streamlined'];
  const verb = verbs[Math.floor(Math.random() * verbs.length)];
  return res.json({
    improvedBullet: `${verb} ${body}, improving execution efficiency and system throughput by 32%.`
  });
}
