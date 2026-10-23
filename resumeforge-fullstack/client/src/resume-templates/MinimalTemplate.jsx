import React from 'react';

export default function MinimalTemplate({ data }) {
  const { personal, education, experience, skills, projects } = data;

  return (
    <div className="tpl-minimal">
      <header className="minimal-header">
        <div>
          <h1 className="minimal-name">{personal.fullName || 'Your Name'}</h1>
          <p className="minimal-role">{personal.title}</p>
        </div>
        <div className="minimal-contact">
          {personal.email && <div>{personal.email}</div>}
          {personal.phone && <div>{personal.phone}</div>}
          {personal.location && <div>{personal.location}</div>}
          {personal.portfolio && <div>{personal.portfolio}</div>}
        </div>
      </header>

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
                  <strong>{proj.name}</strong>
                  {proj.techStack && <span className="minimal-muted"> · {proj.techStack}</span>}
                  {proj.link && <span className="minimal-date">{proj.link}</span>}
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

      <section className="minimal-grid-section">
        <div className="minimal-label">Skills</div>
        <div className="minimal-content minimal-skills-row">
          {[...skills.technical, ...skills.tools, ...skills.soft].join('   ·   ')}
        </div>
      </section>
    </div>
  );
}
