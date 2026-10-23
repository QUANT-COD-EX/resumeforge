import { useMemo } from 'react';

export function useCompletion(resumeData) {
  return useMemo(() => {
    let score = 0;
    const totalChecks = 6;
    const { personal, education, experience, skills, projects } = resumeData;

    if (personal.fullName && personal.email && personal.phone) score += 1;
    if (personal.summary && personal.summary.trim().length > 30) score += 1;
    if (education.length > 0 && education[0].institution) score += 1;
    if (experience.length > 0 && experience[0].company) score += 1;
    if (skills.technical.length >= 3) score += 1;
    if (projects.length > 0 && projects[0].name) score += 1;

    return Math.round((score / totalChecks) * 100);
  }, [resumeData]);
}
