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
  const errors = [];

  // 1. Try Groq (Primary — Llama 3.3 70B & 3.1 8B)
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
                content: 'You are an elite executive technical recruiter. You provide strict, highly personalized, and honest resume reviews. Return strictly valid JSON only.'
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            response_format: { type: 'json_object' }
          }),
          signal: AbortSignal.timeout(16000)
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content;
          const parsed = extractJson(text);
          if (parsed && (parsed.score || parsed.strengths)) {
            parsed.provider = `Groq ${model}`;
            return parsed;
          }
        } else {
          const errText = await res.text();
          errors.push(`Groq (${model}) HTTP ${res.status}: ${errText.slice(0, 150)}`);
          console.error(`Groq (${model}) error:`, res.status, errText);
        }
      } catch (e) {
        errors.push(`Groq (${model}): ${e.message}`);
        console.error(`Groq (${model}) exception:`, e.message);
      }
    }
  } else {
    errors.push('GROQ_API_KEY not found in environment');
  }

  // 2. Try Gemini (Fallback — gemini-1.5-flash & gemini-2.0-flash)
  if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
    for (const model of ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro']) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2
              }
            }),
            signal: AbortSignal.timeout(16000)
          }
        );

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          const parsed = extractJson(text);
          if (parsed && (parsed.score || parsed.strengths)) {
            parsed.provider = `Google Gemini (${model})`;
            return parsed;
          }
        } else {
          const errText = await res.text();
          errors.push(`Gemini (${model}) HTTP ${res.status}: ${errText.slice(0, 150)}`);
          console.error(`Gemini (${model}) error:`, res.status, errText);
        }
      } catch (e) {
        errors.push(`Gemini (${model}): ${e.message}`);
        console.error(`Gemini (${model}) exception:`, e.message);
      }
    }
  } else {
    errors.push('GEMINI_API_KEY not found in environment');
  }

  return { _errors: errors };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const resumeData = req.body?.resumeData || {};

  const prompt = `You are a Silicon Valley technical recruiter and senior engineering manager.
Perform a thorough, honest, and highly specific audit of this resume.
Do NOT give generic or repetitive praise. Specifically reference the candidate's actual projects, job titles, and tech stack in your critique.

Evaluate for:
1. Impact & Measurable Outcomes (metrics, scale, latency, throughput, percentages)
2. ATS Optimization & Keyword Density
3. Action Verbs vs Passive Task-listing
4. Technical Breadth and Project Architecture

Return strictly valid JSON matching this schema:
{
  "score": <float between 1.0 and 10.0 with 1 decimal place, e.g. 7.9>,
  "strengths": [
    "<Specific praise referencing candidate's actual projects, roles, or achievements>",
    "<Specific praise on tech stack, skills, or system design>",
    "<Specific praise on career progression or educational foundation>"
  ],
  "weaknesses": [
    "<Specific constructive criticism on missing metrics, weak bullets, or vague descriptions>",
    "<Specific critique on summary, skills depth, or project scale>"
  ],
  "improvements": [
    "<Actionable, concrete rewrite or addition targeting an actual bullet point in their resume>",
    "<Strategic recommendation for keywords, ATS match, or technical depth>",
    "<Immediate quick win to elevate recruiter response rate>"
  ]
}

Resume Data:
${JSON.stringify(resumeData, null, 2)}`;

  const aiResult = await callLLM(prompt);

  if (aiResult && aiResult.score && Array.isArray(aiResult.strengths) && aiResult.strengths.length > 0) {
    return res.json(aiResult);
  }

  // Dynamic context-aware heuristic fallback if both LLMs failed
  const skills = resumeData?.skills?.technical || [];
  const tools = resumeData?.skills?.tools || [];
  const experience = resumeData?.experience || [];
  const projects = resumeData?.projects || [];
  const roleTitle = resumeData?.personal?.title || 'Software Engineer';

  const allBullets = [
    ...experience.flatMap((e) => e.bullets || []),
    ...projects.flatMap((p) => p.bullets || [])
  ];
  const metricBullets = allBullets.filter((b) => /\d+%|\d+x|\d+\+|\b\d+\b/.test(b));
  const hasGoodMetrics = metricBullets.length >= 2;

  const baseScore = 6.8 + (hasGoodMetrics ? 1.4 : 0.4) + Math.min(1.2, (skills.length + tools.length) * 0.12) + (projects.length >= 2 ? 0.6 : 0);
  const score = Math.min(9.3, Math.max(5.8, baseScore)).toFixed(1);

  return res.json({
    score: Number(score),
    provider: 'Heuristic Engine (Keys offline or redeploy pending on Vercel)',
    debugErrors: aiResult?._errors || [],
    strengths: [
      `Technical catalog showcases ${skills.length} core technologies (${skills.slice(0, 4).join(', ') || 'software stack'}).`,
      projects.length > 0
        ? `Hands-on practical implementation demonstrated in ${projects.map((p) => p.name).filter(Boolean).slice(0, 2).join(' and ') || 'projects'}.`
        : `Clear chronological career progression aligned with ${roleTitle}.`,
      hasGoodMetrics
        ? `Includes quantifiable achievements across ${metricBullets.length} project/experience bullets.`
        : `Clean visual hierarchy optimized for modern ATS parsers.`
    ],
    weaknesses: [
      hasGoodMetrics
        ? `Professional summary could highlight specific architecture scale, system throughput, or business ROI.`
        : `Several experience and project bullets lack quantifiable impact (e.g., % latency reduction, user volume, throughput).`,
      skills.length < 6
        ? `Technical skills list is relatively lean; consider expanding with testing frameworks and cloud tools.`
        : `Ensure every bullet leads with a strong past-tense action verb (Spearheaded, Architected) rather than descriptive tasks.`
    ],
    improvements: [
      `Format every bullet point using Google's XYZ formula: "Accomplished [X], measured by [Y], by doing [Z]".`,
      projects[0]?.name
        ? `Add concrete production metrics or benchmark numbers to "${projects[0].name}".`
        : `Feature 1-2 end-to-end full-stack projects showcasing architecture complexity.`,
      `Run the Tailor to JD tool to inject role-specific keywords prior to final PDF export.`
    ]
  });
}
