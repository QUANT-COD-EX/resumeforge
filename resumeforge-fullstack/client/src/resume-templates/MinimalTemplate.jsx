import React from 'react';
import { ProjectTitle, LinkedInLink, GitHubLink, PortfolioLink } from './templateLinks.jsx';

export default function MinimalTemplate({ data }) {
  const { personal, education, experience, skills, projects } = data;
  const hasContact = personal.email || personal.phone || personal.location || personal.linkedin || personal.github || personal.portfolio;
  const hasSkills = (skills?.technical?.length > 0) || (skills?.tools?.length > 0) || (skills?.soft?.length > 0);
  const hasHeader = personal.fullName || personal.title || hasContact;

  return (
    <div className="tpl-minimal">
      {hasHeader && (
        <header className="minimal-header">
          <div>
            {personal.fullName && <h1 className="minimal-name">{personal.fullName}</h1>}
            {personal.title && <p className="minimal-role">{personal.title}</p>}
          </div>
          {hasContact && (
            <div className="minimal-contact">
              {personal.email && <div>{personal.email}</div>}
              {personal.phone && <div>{personal.phone}</div>}
              {personal.location && <div>{personal.location}</div>}
              {personal.linkedin && (
                <div>
                  <LinkedInLink url={personal.linkedin} className="minimal-link-item" iconSize={12} />
                </div>
              )}
              {personal.github && (
                <div>
                  <GitHubLink url={personal.github} className="minimal-link-item" iconSize={12} />
                </div>
              )}
              {personal.portfolio && (
                <div>
                  <PortfolioLink url={personal.portfolio} className="minimal-link-item" iconSize={12} />
                </div>
              )}
            </div>
          )}
        </header>
      )}

      {personal.summary && (
        <section className="minimal-grid-section">
          <div className="minimal-label">About</div>
          <div className="minimal-content"><p className="minimal-summary">{personal.summary}</p></div>
        </section>
      )}

      {experience.length > 0 && (
        <section className="minimal-grid-section">
          <div className="minimal-label">Experience</div>
          <div className="minimal-content">
            {experience.map((exp) => (
              <div key={exp.id} className="minimal-item">
                <div className="minimal-item-head">
                  <strong>{exp.role}</strong> — <span>{exp.company}</span>
                  <span className="minimal-date">{exp.startDate} – {exp.endDate}</span>
                </div>
                <ul className="minimal-list">
                  {exp.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="minimal-grid-section">
          <div className="minimal-label">Projects</div>
          <div className="minimal-content">
            {projects.map((proj) => (
              <div key={proj.id} className="minimal-item">
                <div className="minimal-item-head">
                  <strong>
                    <ProjectTitle proj={proj} className="minimal-proj-title-link" />
                  </strong>
                  {proj.techStack && <span className="minimal-muted"> · {proj.techStack}</span>}
                </div>
                <ul className="minimal-list">
                  {proj.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section className="minimal-grid-section">
          <div className="minimal-label">Education</div>
          <div className="minimal-content">
            {education.map((edu) => (
              <div key={edu.id} className="minimal-item">
                <div className="minimal-item-head">
                  <strong>{edu.degree}</strong> — <span>{edu.institution}</span>
                  <span className="minimal-date">{edu.startDate} – {edu.endDate}</span>
                </div>
                {edu.gpa && <div className="minimal-muted">GPA: {edu.gpa}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {hasSkills && (
        <section className="minimal-grid-section">
          <div className="minimal-label">Skills</div>
          <div className="minimal-content minimal-skills-row">
            {[...(skills.technical || []), ...(skills.tools || []), ...(skills.soft || [])].join('   ·   ')}
          </div>
        </section>
      )}
    </div>
  );
}
