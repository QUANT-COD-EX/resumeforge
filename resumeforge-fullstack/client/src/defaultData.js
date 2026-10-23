export const INITIAL_RESUME_STATE = {
  meta: {
    template: 'modern',
    lastUpdated: new Date().toISOString()
  },
  personal: {
    fullName: 'Aarav Mehta',
    title: 'Full-Stack Software Engineer',
    email: 'aarav.mehta@example.com',
    phone: '+91 98765 43210',
    location: 'Mumbai, Maharashtra',
    linkedin: 'linkedin.com/in/aaravmehta',
    portfolio: 'github.com/aaravmehta',
    summary: 'Detail-oriented Full-Stack Engineer experienced in building scalable React applications, Python AI microservices, and high-throughput REST APIs. Passionate about clean architecture and developer tooling.'
  },
  education: [
    {
      id: 'edu-1',
      institution: 'University of Mumbai',
      degree: 'B.E. in Computer Engineering',
      field: 'Computer Science & Engineering',
      startDate: '2023',
      endDate: '2027',
      gpa: '9.2 / 10.0'
    }
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'TechNova Solutions',
      role: 'Software Engineering Intern',
      startDate: 'May 2025',
      endDate: 'Aug 2025',
      current: false,
      bullets: [
        'Architected a real-time analytics dashboard using React 18 and Node.js, reducing report load latency by 42%.',
        'Engineered automated REST API pipelines handling 15,000+ daily requests with 99.9% uptime.',
        'Collaborated with cross-functional teams to migrate legacy modules to modular CSS and Vite.'
      ]
    }
  ],
  skills: {
    technical: ['React.js', 'Python', 'Node.js', 'SQLite', 'Java', 'C++', 'HTML5 & CSS3', 'REST APIs'],
    tools: ['Git & GitHub', 'Docker', 'Vite', 'Linux', 'Postman'],
    soft: ['Technical Leadership', 'Problem Solving', 'Agile Collaboration']
  },
  projects: [
    {
      id: 'proj-1',
      name: 'ResumeForge — AI Resume Builder',
      techStack: 'React.js, Pure CSS3, Node.js, Python, SQLite',
      link: 'resumeforge-henna.vercel.app',
      bullets: [
        'Built a pixel-accurate live A4 resume builder supporting 4 dynamic templates and instant PDF/DOCX exports.',
        'Integrated dual-LLM fallback architecture (Groq Llama 3.3 70B + Gemini 2.5 Flash) for real-time resume scoring and job description tailoring.'
      ]
    },
    {
      id: 'proj-2',
      name: 'RouteForge — Multi-Modal Travel Planner',
      techStack: 'React, Python, REST APIs',
      link: 'github.com/aaravmehta/routeforge',
      bullets: [
        'Developed an end-to-end itinerary optimization engine aggregating transit routes and real-time cost comparisons.'
      ]
    }
  ]
};

export const EMPTY_SECTION_DEFAULTS = {
  personal: {
    fullName: '', title: '', email: '', phone: '', location: '', linkedin: '', portfolio: '', summary: ''
  },
  education: [],
  experience: [],
  skills: { technical: [], tools: [], soft: [] },
  projects: []
};
