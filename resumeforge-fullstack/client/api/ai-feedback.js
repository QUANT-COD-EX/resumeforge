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

  // 1. Try Groq (Primary)
  if (groqKey && groqKey !== 'your_groq_api_key_here') {
    let availableModels = [];
    try {
      const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${groqKey}` },
        signal: AbortSignal.timeout(5000)
      });
      if (modelsRes.ok) {
        const mData = await modelsRes.json();
        const available = (mData.data || []).map((m) => m.id);
        const preferences = [
          'openai/gpt-oss-120b',
          'llama-3.3-70b-versatile',
          'llama-3.1-70b-versatile',
          'llama3-70b-8192',
          'openai/gpt-oss-20b',
          'llama-3.1-8b-instant',
          'llama3-8b-8192',
          'mixtral-8x7b-32768',
          'gemma2-9b-it'
        ];
        availableModels = preferences.filter((p) => available.includes(p));
        if (availableModels.length === 0 && available.length > 0) {
          availableModels = available.slice(0, 3);
        }
      }
    } catch (e) {
      errors.push(`Groq list models exception: ${e.message}`);
    }

    if (availableModels.length === 0) {
      availableModels = ['llama-3.1-70b-versatile', 'llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768'];
    }

    for (const model of availableModels) {
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

  // 2. Try Gemini (Fallback)
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

  return { error: 'All AI providers failed', debugErrors: errors };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const resumeData = req.body?.resumeData || {};
  const personal = resumeData.personal || {};
  const experience = resumeData.experience || [];
  const projects = resumeData.projects || [];
  const skills = resumeData.skills || {};

  const prompt = `You are a strict, senior technical recruiter and hiring manager at a top-tier tech company.
Analyze this candidate's resume data in depth and return an honest, highly actionable critique.

Candidate Profile:
- Name: ${personal.fullName || 'Candidate'}
- Title: ${personal.title || 'Not specified'}
- Summary: ${personal.summary || 'None provided'}
- Experience (${experience.length} roles): ${JSON.stringify(experience.map((e) => ({ role: e.role, company: e.company, bullets: e.bullets })))}
- Projects (${projects.length} projects): ${JSON.stringify(projects.map((p) => ({ name: p.name, tech: p.techStack, bullets: p.bullets })))}
- Technical Skills: ${(skills.technical || []).join(', ')}

Return strictly valid JSON with this exact schema:
{
  "score": <number between 5.0 and 9.5 based on impact, metrics, formatting, and ATS readiness>,
  "strengths": [
    "<detailed bullet about a genuine strength in their background, metrics, or technologies>",
    "<another specific strength>"
  ],
  "weaknesses": [
    "<specific, constructive critique about what is missing, vague bullets, or lack of metrics>",
    "<another concrete weakness>"
  ],
  "improvements": [
    "<specific action item candidate should take immediately>",
    "<action item 2>",
    "<action item 3>"
  ]
}`;

  const aiResult = await callLLM(prompt);

  if (aiResult && aiResult.score && !aiResult.error) {
    return res.json(aiResult);
  }

  // Heuristic fallback
  const techSkills = skills.technical || [];
  const allBullets = [
    ...experience.flatMap((e) => e.bullets || []),
    ...projects.flatMap((p) => p.bullets || [])
  ];
  const hasNumbers = allBullets.some((b) => /\d+%|\d+x|\d+\+|\$\d+|\b\d+\b/.test(b));
  const hasActionVerbs = allBullets.some((b) => /^(architected|engineered|spearheaded|developed|optimized|implemented|deployed|built)/i.test(b.trim()));

  let calculatedScore = 6.2;
  if (techSkills.length >= 6) calculatedScore += 0.8;
  if (hasNumbers) calculatedScore += 1.2;
  if (hasActionVerbs) calculatedScore += 0.6;
  if (experience.length >= 2 || projects.length >= 2) calculatedScore += 0.6;
  calculatedScore = Math.min(9.4, Math.max(5.5, Number(calculatedScore.toFixed(1))));

  const strengths = [];
  if (techSkills.length > 0) {
    strengths.push(`Technical catalog showcases ${techSkills.length} core technologies (${techSkills.slice(0, 4).join(', ')}).`);
  }
  if (experience.length > 0) {
    strengths.push(`Clear chronological career progression aligned with ${personal.title || 'software engineering'}.`);
  } else {
    strengths.push('Clean visual hierarchy optimized for modern ATS parsers.');
  }
  if (hasNumbers) {
    strengths.push('Includes quantitative benchmarks and numerical impact across key bullet points.');
  }

  const weaknesses = [];
  if (!hasNumbers) {
    weaknesses.push('Several experience and project bullets lack quantifiable impact (e.g., % latency reduction, user volume, throughput).');
  }
  if (techSkills.length < 8) {
    weaknesses.push('Technical skills list is relatively lean; consider expanding with testing frameworks and cloud tools.');
  }
  if (!personal.summary || personal.summary.length < 80) {
    weaknesses.push('Professional summary does not clearly state target role, years of experience, or primary value proposition.');
  }

  const improvements = [
    `Format every bullet point using Google's XYZ formula: "Accomplished [X], measured by [Y], by doing [Z]".`,
    'Feature 1-2 end-to-end full-stack projects showcasing architecture complexity.',
    'Run the Tailor to JD tool to inject role-specific keywords prior to final PDF export.'
  ];

  return res.json({
    score: calculatedScore,
    provider: 'Heuristic Engine (Keys offline or redeploy pending on Vercel)',
    debugErrors: aiResult?.debugErrors || [],
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    improvements
  });
}
