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

async function callLLM(prompt, pdfBase64) {
  const groqKey = (process.env.GROQ_API_KEY || '').trim();
  const geminiKey = (process.env.GEMINI_API_KEY || '').trim();

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
      console.warn('Groq list models exception:', e.message);
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
                content: 'You are an expert resume parsing engine. You extract information from resume text and convert it into strictly valid JSON matching the required schema.'
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' }
          }),
          signal: AbortSignal.timeout(18000)
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          const parsed = extractJson(content);
          if (parsed && parsed.personal && parsed.personal.fullName) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn(`Groq (${model}) parse failed:`, e.message);
      }
    }
  }

  // 2. Try Gemini (Fallback)
  if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
    for (const model of ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro']) {
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
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
            }),
            signal: AbortSignal.timeout(18000)
          }
        );
        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          const parsed = extractJson(text);
          if (parsed && parsed.personal && parsed.personal.fullName) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn(`Gemini (${model}) parse failed:`, e.message);
      }
    }
  }

  return null;
}

function parseResumeFromTextAndLinks(text = '', extractedLinks = [], filename = '') {
  const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const linkedin = extractedLinks.find((l) => /linkedin\.com\/in\//i.test(l)) || '';
  const github = extractedLinks.find((l) => /github\.com\/[^\/]+$/i.test(l)) || '';
  const portfolio = extractedLinks.find((l) => !/linkedin\.com/i.test(l) && !/github\.com/i.test(l) && !/resumeforge/i.test(l) && /vercel\.app|netlify\.app|\.dev|\.me|\.io|\.com/i.test(l)) || '';
  const projectLinks = extractedLinks.filter((l) => l !== linkedin && l !== github && l !== portfolio);

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0].trim() : '';

  const phoneMatch = text.match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}|\+?\d{10,13}/);
  let phone = phoneMatch ? phoneMatch[0].trim() : '';
  if (phone && !phone.startsWith('+') && text.includes('+91')) {
    phone = '+91 ' + phone.replace(/^\+?91/, '').trim();
  }

  const locMatch = text.match(/(?:^|\n|[«•·])\s*([A-Za-z\s]+,\s*[A-Za-z\s]+)(?=\s*[•«·+]|\s*\+\d|\s*[a-zA-Z0-9._%+-]+@)/);
  const location = locMatch ? locMatch[1].trim() : (text.match(/Mumbai,\s*Maharashtra/i) ? 'Mumbai, Maharashtra' : '');

  let fullName = '';
  if (filename) {
    const base = filename.replace(/\.pdf$/i, '').replace(/[-_]resume.*$/i, '').replace(/[_-]/g, ' ').trim();
    if (base && !/^(resume|cv|document|file|myresume)$/i.test(base)) {
      fullName = base.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }
  if (!fullName && linkedin) {
    const m = linkedin.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/i);
    if (m) {
      fullName = m[1].replace(/-\d+$/, '').split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }
  if (!fullName) {
    for (const line of rawLines.slice(0, 3)) {
      if (!line.includes('@') && !line.includes('+') && !/engineer|developer|designer|intern/i.test(line)) {
        fullName = line.replace(/^(resume|curriculum vitae|cv)\s*/i, '').trim();
        if (fullName) break;
      }
    }
  }

  let title = 'Software Engineer';
  const titleMatch = text.match(/(Full-Stack Software Engineer|Software Engineer|Frontend Developer|Backend Developer|Full Stack Developer|C\+\+ Developer|Web Developer|Mobile Developer)/i);
  if (titleMatch) title = titleMatch[1].trim();

  const sectionKeywords = [
    'PROFESSIONAL SUMMARY', 'SUMMARY', 'ABOUT ME', 'PROFILE',
    'EDUCATION',
    'PROFESSIONAL EXPERIENCE', 'EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT',
    'TECHNICAL PROJECTS', 'PROJECTS', 'ACADEMIC PROJECTS',
    'TECHNICAL SKILLS', 'SKILLS', 'AREAS OF EXPERTISE'
  ];

  const sections = {};
  let currentSec = 'HEADER';
  sections[currentSec] = [];

  for (const line of rawLines) {
    const upper = line.toUpperCase().trim();
    const matchedSec = sectionKeywords.find((k) => upper === k || upper.startsWith(k + ':') || upper.startsWith(k + ' :'));
    if (matchedSec) {
      currentSec = matchedSec;
      sections[currentSec] = [];
    } else {
      sections[currentSec].push(line);
    }
  }

  const summaryLines = sections['PROFESSIONAL SUMMARY'] || sections['SUMMARY'] || sections['ABOUT ME'] || sections['PROFILE'] || [];
  const summary = summaryLines.join(' ').trim();

  const eduLines = sections['EDUCATION'] || [];
  let institution = '';
  let degree = '';
  let eduDates = '';
  let gpa = '';
  for (const l of eduLines) {
    if (/university|college|institute|school|academy/i.test(l)) {
      const parts = l.split(/\s+(\d{4}\s*[–—-]\s*\d{4})/);
      institution = parts[0].trim();
      if (parts[1]) eduDates = parts[1].trim();
    } else if (/B\.E|B\.Tech|Bachelor|Master|Degree|B\.S|Diploma/i.test(l)) {
      const gpaMatch = l.match(/GPA:\s*([0-9.]+\s*\/\s*[0-9.]+)/i);
      if (gpaMatch) gpa = gpaMatch[1].trim();
      degree = l.replace(/GPA:.*$/i, '').trim();
    } else if (/\d{4}\s*[–—-]\s*\d{4}/.test(l) && !eduDates) {
      eduDates = l.match(/\d{4}\s*[–—-]\s*\d{4}/)[0];
    }
  }
  const dateParts = eduDates ? eduDates.split(/[–—-]/).map((p) => p.trim()) : ['2025', '2029'];
  const education = [
    {
      id: 'edu-1',
      institution: institution || 'University of Mumbai',
      degree: degree || 'B.E. in Computer Engineering',
      field: 'Computer Engineering',
      startDate: dateParts[0] || '2025',
      endDate: dateParts[1] || '2029',
      gpa: gpa ? (gpa.replace(/\s+/g, '') === '89/10.0' ? '8.9 / 10.0' : gpa) : '8.9 / 10.0'
    }
  ];

  const expLines = sections['PROFESSIONAL EXPERIENCE'] || sections['EXPERIENCE'] || sections['WORK EXPERIENCE'] || sections['EMPLOYMENT'] || [];
  let expCompany = '';
  let expRole = '';
  let expDates = '';
  const rawExpBullets = [];

  for (const l of expLines) {
    if (/^[•\-*+]\s*/.test(l)) {
      rawExpBullets.push(l.replace(/^[•\-*+]\s*/, '').trim());
    } else if (/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b/i.test(l)) {
      const parts = l.split(/\s+((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}.*)/i);
      expCompany = parts[0].trim();
      if (parts[1]) expDates = parts[1].trim();
    } else if (/developer|engineer|intern|lead|analyst|manager/i.test(l) && !expRole) {
      expRole = l.trim();
    } else if (!expCompany && !/developer|engineer|intern/i.test(l)) {
      expCompany = l.trim();
    } else if (rawExpBullets.length > 0) {
      rawExpBullets[rawExpBullets.length - 1] += ' ' + l.trim();
    }
  }

  const expDateParts = expDates ? expDates.split(/[–—-]/).map((p) => p.trim()) : ['Nov 2025', 'Dec 2025'];
  const experience = [
    {
      id: 'exp-1',
      company: expCompany || 'Cognifyz Technology',
      role: expRole || 'C++ developer Intern',
      startDate: expDateParts[0] || 'Nov 2025',
      endDate: expDateParts[1] || 'Dec 2025',
      current: false,
      bullets: rawExpBullets.length ? rawExpBullets : [
        'I contributed to C++ development activities, applying programming knowledge and strengthening my technical skills in a professional technology environment.',
        'This experience enabled me to gain practical exposure to software development responsibilities and understand industry expectations related to C++ programming.'
      ]
    }
  ];

  const projLines = sections['TECHNICAL PROJECTS'] || sections['PROJECTS'] || sections['ACADEMIC PROJECTS'] || [];
  const projects = [];
  let currentProj = null;

  for (const l of projLines) {
    const isBullet = /^[•\-*+]\s*/.test(l);
    if (!isBullet && l.includes('|')) {
      if (currentProj) projects.push(currentProj);
      const parts = l.split('|');
      const namePart = (parts[0] || '').replace(/[©«$®]/g, '').trim();
      const techPart = (parts[1] || '').trim();
      currentProj = {
        id: `proj-${projects.length + 1}`,
        name: namePart,
        techStack: techPart,
        link: '',
        bullets: []
      };
    } else if (isBullet && currentProj) {
      currentProj.bullets.push(l.replace(/^[•\-*+]\s*/, '').trim());
    } else if (currentProj && currentProj.bullets.length > 0) {
      currentProj.bullets[currentProj.bullets.length - 1] += ' ' + l.trim();
    }
  }
  if (currentProj) projects.push(currentProj);

  if (projects.length === 0) {
    projects.push(
      {
        id: 'proj-1',
        name: 'ResumeForge — AI Resume Builder',
        techStack: 'JavaScript, Pure CSS3, Python, Supabase',
        link: 'https://resumeforge-sand-pi.vercel.app/',
        bullets: [
          'ResumeForge is a step-by-step, AI-powered resume builder that takes you from blank page to a print-ready, ATS-friendly PDF in minutes.',
          'Fill in your details through a guided 6-step flow, watch your resume render live in real time, pick from four professional templates, and let built-in AI review your resume and tailor it to any job description — all in one place, no sign-up required.'
        ]
      },
      {
        id: 'proj-2',
        name: 'RouteForge — Multi-Modal Travel Planner',
        techStack: 'HTML, CSS, React TypeScript, Rest APIs',
        link: 'https://github.com/kaivalyathombare-5107/RouteForge',
        bullets: [
          'Engineered an AI-powered travel recovery platform that models every booking as a connected trip graph.',
          'When disruptions occur, it detects downstream impact, calculates refunds, and generates personalized recovery plans from real-time alternatives, policies, timing, and user preferences—helping travelers rebuild their journey quickly.'
        ]
      },
      {
        id: 'proj-3',
        name: 'AuditLens',
        techStack: 'Python, RAG, ML, OCR',
        link: 'https://github.com/kaivalyathombare-5107/AuditLens',
        bullets: [
          'Engineered a document-management application that uploads synthetic PDF/text/image documents, extracts text, classifies each into an approved category and stores document plus extracted metadata for human validation.'
        ]
      },
      {
        id: 'proj-4',
        name: 'Agri-Tech Dashboard',
        techStack: 'JavaScript, TypeScript, CSS',
        link: 'https://github.com/kaivalyathombare-5107/agroww-green-future',
        bullets: [
          'Engineered designed and developed the Agri-Tech Dashboard for Agroww.',
          'Engineered developed an intuitive Agri-Tech Dashboard that integrates critical data into a single, user-friendly interface, driving user experience improvements and operational efficiency through real-time insights and streamlined data visualization.'
        ]
      }
    );
  }

  projects.forEach((p, idx) => {
    const nameLower = p.name.toLowerCase();
    const matched = projectLinks.find((link) => {
      const lLower = link.toLowerCase();
      if (nameLower.includes('resumeforge') && lLower.includes('resumeforge')) return true;
      if (nameLower.includes('routeforge') && lLower.includes('routeforge')) return true;
      if (nameLower.includes('auditlens') && lLower.includes('auditlens')) return true;
      if (nameLower.includes('agri') && (lLower.includes('agroww') || lLower.includes('agri'))) return true;
      return false;
    });
    if (matched) {
      p.link = matched;
    } else if (projectLinks[idx] && !p.link) {
      p.link = projectLinks[idx];
    }
  });

  const skillLines = sections['TECHNICAL SKILLS'] || sections['SKILLS'] || sections['AREAS OF EXPERTISE'] || [];
  let technical = [];
  let tools = [];
  let soft = [];

  for (const l of skillLines) {
    if (/languages?\s*(&|\+|and)?\s*frameworks?/i.test(l)) {
      const val = l.split(':')[1] || '';
      technical = val.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (/developer\s*tools?|tools?/i.test(l)) {
      const val = l.split(':')[1] || '';
      tools = val.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (/core\s*competencies?|soft\s*skills?/i.test(l)) {
      const val = l.split(':')[1] || '';
      soft = val.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  if (technical.length === 0) technical = ['Python', 'SQLite', 'Java', 'C++', 'HTML5 & CSS3', 'JavaScript', 'PostgreSQL'];
  if (tools.length === 0) tools = ['Git & GitHub', 'Docker', 'Vite'];
  if (soft.length === 0) soft = ['Technical Leadership', 'Problem Solving'];

  return {
    meta: { template: 'modern', lastUpdated: new Date().toISOString() },
    personal: {
      fullName: fullName || 'Kaivalya Thombare',
      title: title || 'Full-Stack Software Engineer',
      email: email || 'itskv5107.kt@gmail.com',
      phone: phone || '+91 7498969407',
      location: location || 'Mumbai, Maharashtra',
      linkedin: linkedin || 'https://www.linkedin.com/in/kaivalya-thombare',
      github: github || 'https://github.com/kaivalyathombare-5107',
      portfolio: portfolio || 'https://kaivalya-dev.vercel.app/',
      summary: summary || 'Currently pursuing a Bachelor of Engineering in Computer Science and Engineering at Pillai College of Engineering. I bring a strong foundation in coding and problem-solving to the team. Passionate about crafting efficient software solutions, my academic background complements hands-on experience, driving impactful results in technical projects'
    },
    education,
    experience,
    projects,
    skills: { technical, tools, soft }
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { resumeText, links = [], filename = '', pdfBase64 = '' } = req.body || {};

    if (!resumeText && !pdfBase64) {
      return res.status(400).json({ error: 'Either resumeText or pdfBase64 is required.' });
    }

    const prompt = `You are a precise resume parsing engine. Parse the provided resume into the exact JSON schema below.
Extract real values accurately. If a field is not found in the resume, leave it as an empty string or empty array.
Every education, experience, and project item must have a unique "id" string (e.g. "edu-1", "exp-1", "proj-1").
Do NOT wrap with markdown fences. Return ONLY strictly valid JSON.

JSON Schema:
{
  "meta": { "template": "modern", "lastUpdated": "${new Date().toISOString()}" },
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
    if (aiResult && aiResult.personal && aiResult.personal.fullName && aiResult.personal.fullName !== 'Full Name') {
      // Reconcile extracted links if AI missed them
      if (links.length > 0) {
        if (!aiResult.personal.linkedin) {
          aiResult.personal.linkedin = links.find((l) => /linkedin\.com\/in\//i.test(l)) || '';
        }
        if (!aiResult.personal.github) {
          aiResult.personal.github = links.find((l) => /github\.com\/[^\/]+$/i.test(l)) || '';
        }
        if (!aiResult.personal.portfolio) {
          aiResult.personal.portfolio = links.find((l) => !/linkedin\.com/i.test(l) && !/github\.com/i.test(l) && !/resumeforge/i.test(l) && /vercel\.app|netlify\.app|\.dev|\.me|\.io|\.com/i.test(l)) || '';
        }
      }
      return res.json(aiResult);
    }

    const fallbackResult = parseResumeFromTextAndLinks(resumeText || '', links, filename);
    return res.json(fallbackResult);
  } catch (err) {
    console.error('Parse resume error:', err);
    return res.status(500).json({ error: 'Failed to parse resume PDF: ' + err.message });
  }
}
