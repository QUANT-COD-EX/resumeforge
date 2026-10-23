export const EMPTY_SECTION_DEFAULTS = {
  personal: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    summary: ''
  },
  education: [],
  experience: [],
  skills: {
    technical: [],
    tools: [],
    soft: []
  },
  projects: []
};

export const INITIAL_RESUME_STATE = {
  meta: {
    template: 'modern',
    lastUpdated: new Date().toISOString()
  },
  ...EMPTY_SECTION_DEFAULTS
};
