import React from 'react';

export default function ModernTemplate({ data }) {
  const { personal, education, experience, skills, projects } = data;

  return (
    <div className="tpl-modern">
      <aside className="modern-sidebar">
        <div className="modern-identity">
          <h1 className="modern-name">{personal.fullName || 'Your Name'}</h1>
          <p className="modern-title">{personal.title || 'Professional Title'}</p>
        </div>

        <div className="modern-side-section">
          <h3 className="modern-side-heading">Contact</h3>
          <ul className="modern-contact-list">
            {personal.email && <li>{personal.email}</li>}
            {personal.phone && <li>{personal.phone}</li>}
            {personal.location && <li>{personal.location}</li>}
            {personal.linkedin && <li>{personal.linkedin}</li>}
            {personal.portfolio && <li>{personal.portfolio}</li>}
          </ul>
        </div>

        {education.length > 0 && (
          <div className="modern-side-section">
            <h3 className="modern-side-heading">Education</h3>
            {education.map((edu) => (
              <div key={edu.id} className="modern-edu-item">
                <div className="modern-edu-degree">{edu.degree}</div>
                <div className="modern-edu-inst">{edu.institution}</div>
                <div className="modern-edu-meta">
                  <span>{edu.startDate} – {edu.endDate}</span>
                  {edu.gpa && <span>• GPA: {edu.gpa}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="modern-side-section">
          <h3 className="modern-side-heading">Skills</h3>
          {skills.technical.length > 0 && (
            <div className="modern-skill-group">
              <span className="modern-skill-label">Technical</span>
              <div className="modern-skill-tags">
                {skills.technical.map((s) => <span key={s} className="modern-tag">{s}</span>)}
              </div>
            </div>
          )}
          {skills.tools.length > 0 && (
            <div className="modern-skill-group">
              <span className="modern-skill-label">Tools</span>
              <div className="modern-skill-tags">
                {skills.tools.map((s) => <span key={s} className="modern-tag">{s}</span>)}
              </div>
            </div>
          )}
          {skills.soft.length > 0 && (
            <div className="modern-skill-group">
              <span className="modern-skill-label">Core</span>
              <div className="modern-skill-tags">
                {skills.soft.map((s) => <span key={s} className="modern-tag">{s}</span>)}
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="modern-main">
        {personal.summary && (
          <section className="modern-section">
            <h2 className="modern-section-title">Profile Summary</h2>
            <p className="modern-summary-text">{personal.summary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section className="modern-section">
            <h2 className="modern-section-title">Work Experience</h2>
            {experience.map((exp) => (
              <div key={exp.id} className="modern-entry">
                <div className="modern-entry-header">
                  <div>
                    <h4 className="modern-role">{exp.role}</h4>
                    <span className="modern-company">{exp.company}</span>
                  </div>
                  <span className="modern-dates">{exp.startDate} – {exp.endDate}</span>
                </div>
                <ul className="modern-bullets">
                  {exp.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            ))}
          </section>
        )}

        {projects.length > 0 && (
          <section className="modern-section">
            <h2 className="modern-section-title">Key Projects</h2>
            {projects.map((proj) => (
              <div key={proj.id} className="modern-entry">
                <div className="modern-entry-header">
                  <div>
                    <h4 className="modern-role">{proj.name}</h4>
                    {proj.techStack && <span className="modern-tech">{proj.techStack}</span>}
                  </div>
                  {proj.link && <span className="modern-link">{proj.link}</span>}
                </div>
                <ul className="modern-bullets">
                  {proj.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
