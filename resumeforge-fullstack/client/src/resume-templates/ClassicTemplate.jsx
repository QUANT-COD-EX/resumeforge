import React from 'react';
import { ProjectTitle, LinkedInLink, GitHubLink, PortfolioLink } from './templateLinks.jsx';

export default function ClassicTemplate({ data }) {
  const { personal, education, experience, skills, projects } = data;

  return (
    <div className="tpl-classic">
      <header className="classic-header">
        <h1 className="classic-name">{personal.fullName || 'YOUR NAME'}</h1>
        {personal.title && <p className="classic-title">{personal.title}</p>}
        <div className="classic-contact-bar">
          {personal.location && <span>{personal.location}</span>}
          {personal.location && personal.phone && <span className="classic-sep"> • </span>}
          {personal.phone && <span>{personal.phone}</span>}
          {(personal.location || personal.phone) && personal.email && <span className="classic-sep"> • </span>}
          {personal.email && <span>{personal.email}</span>}
          {(personal.location || personal.phone || personal.email) && personal.linkedin && <span className="classic-sep"> • </span>}
          {personal.linkedin && <LinkedInLink url={personal.linkedin} className="classic-link-item" iconSize={12} />}
          {personal.github && <span className="classic-sep"> • </span>}
          {personal.github && <GitHubLink url={personal.github} className="classic-link-item" iconSize={12} />}
          {personal.portfolio && <span className="classic-sep"> • </span>}
          {personal.portfolio && <PortfolioLink url={personal.portfolio} className="classic-link-item" iconSize={12} />}
        </div>
      </header>

      {personal.summary && (
        <section className="classic-section">
          <h2 className="classic-section-heading">Professional Summary</h2>
          <p className="classic-paragraph">{personal.summary}</p>
        </section>
      )}

      {education.length > 0 && (
        <section className="classic-section">
          <h2 className="classic-section-heading">Education</h2>
          {education.map((edu) => (
            <div key={edu.id} className="classic-block">
              <div className="classic-row-between">
                <strong>{edu.institution}</strong>
                <span>{edu.startDate} – {edu.endDate}</span>
              </div>
              <div className="classic-row-between italic-row">
                <span>{edu.degree}</span>
                {edu.gpa && <span>GPA: {edu.gpa}</span>}
              </div>
            </div>
          ))}
        </section>
      )}

      {experience.length > 0 && (
        <section className="classic-section">
          <h2 className="classic-section-heading">Professional Experience</h2>
          {experience.map((exp) => (
            <div key={exp.id} className="classic-block">
              <div className="classic-row-between">
                <strong>{exp.company}</strong>
                <span>{exp.startDate} – {exp.endDate}</span>
              </div>
              <div className="classic-row-between italic-row">
                <span>{exp.role}</span>
              </div>
              <ul className="classic-bullets">
                {exp.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {projects.length > 0 && (
        <section className="classic-section">
          <h2 className="classic-section-heading">Technical Projects</h2>
          {projects.map((proj) => (
            <div key={proj.id} className="classic-block">
              <div className="classic-row-between">
                <div>
                  <strong>
                    <ProjectTitle proj={proj} className="classic-proj-title-link" />
                  </strong>
                  {proj.techStack && <span className="classic-tech"> | {proj.techStack}</span>}
                </div>
              </div>
              <ul className="classic-bullets">
                {proj.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}

      <section className="classic-section">
        <h2 className="classic-section-heading">Technical Skills</h2>
        <div className="classic-skills-lines">
          {skills.technical.length > 0 && <p><strong>Languages & Frameworks:</strong> {skills.technical.join(', ')}</p>}
          {skills.tools.length > 0 && <p><strong>Developer Tools:</strong> {skills.tools.join(', ')}</p>}
          {skills.soft.length > 0 && <p><strong>Core Competencies:</strong> {skills.soft.join(', ')}</p>}
        </div>
      </section>
    </div>
  );
}
