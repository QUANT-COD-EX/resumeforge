async function callLLM(prompt, pdfBase64) {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
    try {
      const parts = [{ text: prompt }];
      if (pdfBase64) {
        parts.push({
          inline_data: {
            mime_type: 'application/pdf',
            data: pdfBase64
          }
        });
      }
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
          }),
          signal: AbortSignal.timeout(20000)
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return JSON.parse(text);
      }
    } catch (e) {
      console.warn('Gemini parse failed:', e.message);
    }
  }

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
            {
              role: 'system',
              content: 'You are an expert resume parser. You extract information from resume text and convert it into strictly valid JSON matching the required schema.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' }
        }),
        signal: AbortSignal.timeout(20000)
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return JSON.parse(content);
      }
    } catch (e) {
      console.warn('Groq parse failed:', e.message);
    }
  }

  return null;
}

function heuristicParse(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,13}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : '';

  const githubMatch = text.match(/github\.com\/[a-zA-Z0-9_-]+/i);
  const github = githubMatch ? githubMatch[0] : '';

  const urls = text.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.(?:dev|me|io|tech|vercel\.app|netlify\.app|[a-z]{2,})/gi) || [];
  const portfolio = urls.find((u) => !u.includes('github.com') && !u.includes('linkedin.com') && !u.includes('@')) || '';

  let fullName = 'Applicant Name';
  for (const line of lines.slice(0, 5)) {
    if (!line.includes('@') && !line.includes('http') && !line.match(/\d{4}/) && line.length < 40) {
      fullName = line.replace(/^(resume|curriculum vitae|cv)\s*/i, '').trim();
      if (fullName) break;
    }
  }

  const commonTech = [
    'JavaScript', 'TypeScript', 'React.js', 'React', 'Next.js', 'Node.js', 'Express',
    'Python', 'FastAPI', 'Django', 'Java', 'Spring', 'C++', 'C#', 'Go', 'Rust',
    'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite',
    'HTML5', 'CSS3', 'Tailwind', 'REST APIs', 'GraphQL', 'AWS', 'Azure', 'GCP',
    'Docker', 'Kubernetes', 'CI/CD', 'Git', 'GitHub', 'Linux', 'Vite'
  ];
  const detectedTech = commonTech.filter((skill) =>
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
  );

  return {
    meta: { template: 'modern', lastUpdated: new Date().toISOString() },
    personal: {
      fullName,
      title: 'Software Engineer',
      email,
      phone,
      location: '',
      linkedin,
      github,
      portfolio,
      summary: lines.find((l) => l.length > 80 && !l.includes('@')) || ''
    },
    education: [
      {
        id: `edu-1`,
        institution: lines.find((l) => /university|college|institute|school|b\.?tech|b\.?e\b/i.test(l)) || 'University',
        degree: 'Bachelor of Science / Engineering',
        field: 'Computer Science',
        startDate: '2020',
        endDate: '2024',
        gpa: ''
      }
    ],
    experience: [
      {
        id: `exp-1`,
        company: 'Company',
        role: 'Software Engineer',
        startDate: '2023',
        endDate: 'Present',
        current: true,
        bullets: lines.filter((l) => l.startsWith('•') || l.startsWith('-') || l.startsWith('*')).map((b) => b.replace(/^[•\-*]\s*/, '')).slice(0, 4)
      }
    ],
    skills: {
      technical: detectedTech.length ? detectedTech.slice(0, 10) : ['JavaScript', 'React.js', 'Node.js', 'Python', 'SQL', 'Git'],
      tools: ['Git', 'Docker', 'Linux', 'VS Code'],
      soft: ['Problem Solving', 'Team Collaboration', 'Communication']
    },
    projects: []
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { resumeText, pdfBase64 } = req.body || {};

    if (!resumeText && !pdfBase64) {
      return res.status(400).json({ error: 'Either resumeText or pdfBase64 is required.' });
    }

    const prompt = `You are a precise resume parsing engine. Parse the provided resume into the exact JSON schema below.
Extract real values accurately. If a field is not found in the resume, leave it as an empty string or empty array.
Every education, experience, and project item must have a unique "id" string (e.g. "edu-1", "exp-1", "proj-1").
Do NOT wrap with markdown fences. Return ONLY strictly valid JSON.

JSON Schema:
{
  "meta": {
    "template": "modern",
    "lastUpdated": "${new Date().toISOString()}"
  },
  "personal": {
    "fullName": "Full Name",
    "title": "Professional Title / Target Role",
    "email": "Email Address",
    "phone": "Phone Number",
    "location": "City, Country or State",
    "linkedin": "LinkedIn profile URL or handle",
    "github": "GitHub profile URL or handle",
    "portfolio": "Personal portfolio or personal website URL",
    "summary": "Professional summary or objective (2-4 sentences)"
  },
  "education": [
    {
      "id": "edu-1",
      "institution": "School or University Name",
      "degree": "Degree name (e.g. Bachelor of Science)",
      "field": "Major / Field of Study",
      "startDate": "Start Year / Date",
      "endDate": "End Year / Date",
      "gpa": "GPA if listed"
    }
  ],
  "experience": [
    {
      "id": "exp-1",
      "company": "Company Name",
      "role": "Job Title",
      "startDate": "Start Date (e.g. May 2023)",
      "endDate": "End Date or Present",
      "current": false,
      "bullets": [
        "Action verb + achievement bullet point 1",
        "Action verb + achievement bullet point 2"
      ]
    }
  ],
  "skills": {
    "technical": ["Skill 1", "Skill 2"],
    "tools": ["Tool 1", "Tool 2"],
    "soft": ["Soft Skill 1", "Soft Skill 2"]
  },
  "projects": [
    {
      "id": "proj-1",
      "name": "Project Name",
      "techStack": "Technologies used",
      "link": "Project link or GitHub repo",
      "bullets": [
        "Project description / impact bullet"
      ]
    }
  ]
}

Resume Text:
${resumeText || '(See attached PDF document)'}`;

    const aiResult = await callLLM(prompt, pdfBase64);
    if (aiResult && aiResult.personal && aiResult.personal.fullName) {
      return res.json(aiResult);
    }

    const fallbackResult = heuristicParse(resumeText || '');
    return res.json(fallbackResult);
  } catch (err) {
    console.error('Parse resume error:', err);
    return res.status(500).json({ error: 'Failed to parse resume PDF: ' + err.message });
  }
}
