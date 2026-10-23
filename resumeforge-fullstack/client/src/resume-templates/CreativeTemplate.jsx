import React from 'react';
import { ProjectTitle, LinkedInLink, GitHubLink, PortfolioLink } from './templateLinks.jsx';

export default function CreativeTemplate({ data }) {
  const { personal, education, experience, skills, projects } = data;

  return (
    <div className="tpl-creative">
      <header className="creative-banner">
        <div className="creative-banner-main">
          <h1 className="creative-name">{personal.fullName || 'Your Name'}</h1>
          <p className="creative-tagline">{personal.title}</p>
        </div>
        <div className="creative-contact-pills">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && (
            <span className="creative-social-pill">
              <LinkedInLink url={personal.linkedin} className="creative-link-item" iconSize={12} />
            </span>
          )}
          {personal.github && (
            <span className="creative-social-pill">
              <GitHubLink url={personal.github} className="creative-link-item" iconSize={12} />
            </span>
          )}
          {personal.portfolio && (
            <span className="creative-social-pill">
              <PortfolioLink url={personal.portfolio} className="creative-link-item" iconSize={12} />
            </span>
          )}
        </div>
      </header>

      <div className="creative-body">
        {personal.summary && (
          <div className="creative-summary-box"><p>{personal.summary}</p></div>
        )}

        <div className="creative-two-col">
          <div className="creative-col-primary">
            {experience.length > 0 && (
              <section className="creative-section">
                <h2 className="creative-heading">Experience</h2>
                {experience.map((exp) => (
                  <div key={exp.id} className="creative-card">
                    <div className="creative-card-top">
                      <div>
                        <h4>{exp.role}</h4>
                        <span className="creative-company">{exp.company}</span>
                      </div>
                      <span className="creative-date-badge">{exp.startDate} – {exp.endDate}</span>
                    </div>
                    <ul className="creative-bullets">
                      {exp.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </section>
            )}

            {projects.length > 0 && (
              <section className="creative-section">
                <h2 className="creative-heading">Featured Projects</h2>
                {projects.map((proj) => (
                  <div key={proj.id} className="creative-card">
                    <div className="creative-card-top">
                      <div>
                        <h4>
                          <ProjectTitle proj={proj} className="creative-proj-title-link" />
                        </h4>
                        <span className="creative-company">{proj.techStack}</span>
                      </div>
                    </div>
                    <ul className="creative-bullets">
                      {proj.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </section>
            )}
          </div>

          <div className="creative-col-secondary">
            <section className="creative-section">
              <h2 className="creative-heading">Skills & Stack</h2>
              <div className="creative-Badge-cloud">
                {[...skills.technical, ...skills.tools, ...skills.soft].map((skill) => (
                  <span key={skill} className="creative-skill-pill">{skill}</span>
                ))}
              </div>
            </section>

            {education.length > 0 && (
              <section className="creative-section">
                <h2 className="creative-heading">Education</h2>
                {education.map((edu) => (
                  <div key={edu.id} className="creative-edu-box">
                    <h4>{edu.degree}</h4>
                    <p>{edu.institution}</p>
                    <small>{edu.startDate} – {edu.endDate} {edu.gpa && `• GPA: ${edu.gpa}`}</small>
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
