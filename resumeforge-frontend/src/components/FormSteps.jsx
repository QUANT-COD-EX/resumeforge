import React, { useState } from 'react';
import { RotateCcw, Plus, Trash2 } from 'lucide-react';
import BulletEditor from './BulletEditor.jsx';
import TemplatePicker from './TemplatePicker.jsx';

export default function FormSteps({
  currentStep,
  resumeData,
  updateSection,
  resetSection
}) {
  const [skillInputs, setSkillInputs] = useState({ technical: '', tools: '', soft: '' });

  // Step 0: Personal Info
  const renderPersonalStep = () => {
    const { personal } = resumeData;
    const handleChange = (field, value) => {
      updateSection('personal', { ...personal, [field]: value });
    };

    return (
      <div className="form-step-content fade-in">
        <div className="step-header-bar">
          <div>
            <h3>Personal Information</h3>
            <p className="step-subtitle">Your contact details and headline summary.</p>
          </div>
          <button type="button" className="btn-reset" onClick={() => resetSection('personal')}>
            <RotateCcw size={14} /> Reset Step
          </button>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="field-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={personal.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="e.g., Aarav Mehta"
            />
          </div>
          <div className="form-group">
            <label className="field-label">Professional Title</label>
            <input
              type="text"
              className="form-input"
              value={personal.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Full-Stack Developer"
            />
          </div>
          <div className="form-group">
            <label className="field-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={personal.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label className="field-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              value={personal.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
          <div className="form-group">
            <label className="field-label">Location</label>
            <input
              type="text"
              className="form-input"
              value={personal.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Mumbai, India"
            />
          </div>
          <div className="form-group">
            <label className="field-label">LinkedIn URL</label>
            <input
              type="text"
              className="form-input"
              value={personal.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              placeholder="linkedin.com/in/username"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="field-label">GitHub / Portfolio Link</label>
          <input
            type="text"
            className="form-input"
            value={personal.portfolio}
            onChange={(e) => handleChange('portfolio', e.target.value)}
            placeholder="github.com/username"
          />
        </div>

        <div className="form-group">
          <label className="field-label">Professional Summary</label>
          <textarea
            rows={4}
            className="form-input"
            value={personal.summary}
            onChange={(e) => handleChange('summary', e.target.value)}
            placeholder="Write a concise 2-3 sentence overview highlighting your core strengths..."
          />
        </div>
      </div>
    );
  };

  // Step 1: Education
  const renderEducationStep = () => {
    const { education } = resumeData;

    const updateEdu = (index, field, value) => {
      const updated = [...education];
      updated[index] = { ...updated[index], [field]: value };
      updateSection('education', updated);
    };

    const addEdu = () => {
      updateSection('education', [
        ...education,
        { id: `edu-${Date.now()}`, institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }
      ]);
    };

    const removeEdu = (index) => {
      updateSection('education', education.filter((_, idx) => idx !== index));
    };

    return (
      <div className="form-step-content fade-in">
        <div className="step-header-bar">
          <div>
            <h3>Education</h3>
            <p className="step-subtitle">Academic degrees, universities, and CGPA/grades.</p>
          </div>
          <button type="button" className="btn-reset" onClick={() => resetSection('education')}>
            <RotateCcw size={14} /> Reset Step
          </button>
        </div>

        {education.map((edu, idx) => (
          <div key={edu.id} className="repeater-card">
            <div className="repeater-card-header">
              <span>Education #{idx + 1}</span>
              <button type="button" className="btn-icon-danger" onClick={() => removeEdu(idx)}>
                <Trash2 size={15} />
              </button>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="field-label">Institution / University</label>
                <input
                  type="text"
                  className="form-input"
                  value={edu.institution}
                  onChange={(e) => updateEdu(idx, 'institution', e.target.value)}
                  placeholder="e.g., University of Mumbai"
                />
              </div>
              <div className="form-group">
                <label className="field-label">Degree</label>
                <input
                  type="text"
                  className="form-input"
                  value={edu.degree}
                  onChange={(e) => updateEdu(idx, 'degree', e.target.value)}
                  placeholder="e.g., B.E. in Computer Engineering"
                />
              </div>
              <div className="form-group">
                <label className="field-label">Start Year</label>
                <input
                  type="text"
                  className="form-input"
                  value={edu.startDate}
                  onChange={(e) => updateEdu(idx, 'startDate', e.target.value)}
                  placeholder="2023"
                />
              </div>
              <div className="form-group">
                <label className="field-label">End Year (or Expected)</label>
                <input
                  type="text"
                  className="form-input"
                  value={edu.endDate}
                  onChange={(e) => updateEdu(idx, 'endDate', e.target.value)}
                  placeholder="2027"
                />
              </div>
              <div className="form-group">
                <label className="field-label">CGPA / Percentage</label>
                <input
                  type="text"
                  className="form-input"
                  value={edu.gpa}
                  onChange={(e) => updateEdu(idx, 'gpa', e.target.value)}
                  placeholder="9.2 / 10.0"
                />
              </div>
            </div>
          </div>
        ))}

        <button type="button" className="btn-dashed-add" onClick={addEdu}>
          <Plus size={16} /> Add Education Entry
        </button>
      </div>
    );
  };

  // Step 2: Experience
  const renderExperienceStep = () => {
    const { experience } = resumeData;

    const updateExp = (index, field, value) => {
      const updated = [...experience];
      updated[index] = { ...updated[index], [field]: value };
      updateSection('experience', updated);
    };

    const addExp = () => {
      updateSection('experience', [
        ...experience,
        { id: `exp-${Date.now()}`, company: '', role: '', startDate: '', endDate: '', current: false, bullets: [''] }
      ]);
    };

    const removeExp = (index) => {
      updateSection('experience', experience.filter((_, idx) => idx !== index));
    };

    return (
      <div className="form-step-content fade-in">
        <div className="step-header-bar">
          <div>
            <h3>Work Experience</h3>
            <p className="step-subtitle">Internships, full-time roles, and measurable impact.</p>
          </div>
          <button type="button" className="btn-reset" onClick={() => resetSection('experience')}>
            <RotateCcw size={14} /> Reset Step
          </button>
        </div>

        {experience.map((exp, idx) => (
          <div key={exp.id} className="repeater-card">
            <div className="repeater-card-header">
              <span>Role #{idx + 1}</span>
              <button type="button" className="btn-icon-danger" onClick={() => removeExp(idx)}>
                <Trash2 size={15} />
              </button>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="field-label">Company / Organization</label>
                <input
                  type="text"
                  className="form-input"
                  value={exp.company}
                  onChange={(e) => updateExp(idx, 'company', e.target.value)}
                  placeholder="e.g., TechNova Solutions"
                />
              </div>
              <div className="form-group">
                <label className="field-label">Role / Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={exp.role}
                  onChange={(e) => updateExp(idx, 'role', e.target.value)}
                  placeholder="e.g., Software Engineering Intern"
                />
              </div>
              <div className="form-group">
                <label className="field-label">Start Date</label>
                <input
                  type="text"
                  className="form-input"
                  value={exp.startDate}
                  onChange={(e) => updateExp(idx, 'startDate', e.target.value)}
                  placeholder="May 2025"
                />
              </div>
              <div className="form-group">
                <label className="field-label">End Date</label>
                <input
                  type="text"
                  className="form-input"
                  value={exp.endDate}
                  onChange={(e) => updateExp(idx, 'endDate', e.target.value)}
                  placeholder="Aug 2025 or Present"
                />
              </div>
            </div>

            <BulletEditor
              bullets={exp.bullets}
              roleContext={exp.role}
              onChange={(newBullets) => updateExp(idx, 'bullets', newBullets)}
            />
          </div>
        ))}

        <button type="button" className="btn-dashed-add" onClick={addExp}>
          <Plus size={16} /> Add Work Experience
        </button>
      </div>
    );
  };

  // Step 3: Skills
  const renderSkillsStep = () => {
    const { skills } = resumeData;

    const addSkill = (category) => {
      const value = skillInputs[category].trim();
      if (!value) return;
      if (!skills[category].includes(value)) {
        updateSection('skills', {
          ...skills,
          [category]: [...skills[category], value]
        });
      }
      setSkillInputs({ ...skillInputs, [category]: '' });
    };

    const removeSkill = (category, skillToRemove) => {
      updateSection('skills', {
        ...skills,
        [category]: skills[category].filter((s) => s !== skillToRemove)
      });
    };

    const categories = [
      { key: 'technical', label: 'Languages & Frameworks', placeholder: 'e.g., React.js, Python, C++ (Press Enter)' },
      { key: 'tools', label: 'Developer Tools & Platforms', placeholder: 'e.g., Git, Docker, SQLite, Linux' },
      { key: 'soft', label: 'Core Competencies & Soft Skills', placeholder: 'e.g., Team Leadership, Agile, Problem Solving' }
    ];

    return (
      <div className="form-step-content fade-in">
        <div className="step-header-bar">
          <div>
            <h3>Skills & Technologies</h3>
            <p className="step-subtitle">Add ATS-friendly keywords grouped by category.</p>
          </div>
          <button type="button" className="btn-reset" onClick={() => resetSection('skills')}>
            <RotateCcw size={14} /> Reset Step
          </button>
        </div>

        {categories.map((cat) => (
          <div key={cat.key} className="repeater-card">
            <label className="field-label">{cat.label}</label>
            <div className="skill-input-row">
              <input
                type="text"
                className="form-input"
                value={skillInputs[cat.key]}
                placeholder={cat.placeholder}
                onChange={(e) => setSkillInputs({ ...skillInputs, [cat.key]: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill(cat.key);
                  }
                }}
              />
              <button type="button" className="btn-primary" onClick={() => addSkill(cat.key)}>
                Add
              </button>
            </div>
            <div className="skill-chips-container">
              {skills[cat.key].map((skill) => (
                <span key={skill} className="skill-chip">
                  {skill}
                  <button type="button" onClick={() => removeSkill(cat.key, skill)}>×</button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Step 4: Projects
  const renderProjectsStep = () => {
    const { projects } = resumeData;

    const updateProj = (index, field, value) => {
      const updated = [...projects];
      updated[index] = { ...updated[index], [field]: value };
      updateSection('projects', updated);
    };

    const addProj = () => {
      updateSection('projects', [
        ...projects,
        { id: `proj-${Date.now()}`, name: '', techStack: '', link: '', bullets: [''] }
      ]);
    };

    const removeProj = (index) => {
      updateSection('projects', projects.filter((_, idx) => idx !== index));
    };

    return (
      <div className="form-step-content fade-in">
        <div className="step-header-bar">
          <div>
            <h3>Key Projects</h3>
            <p className="step-subtitle">Showcase hackathons, full-stack apps, and technical builds.</p>
          </div>
          <button type="button" className="btn-reset" onClick={() => resetSection('projects')}>
            <RotateCcw size={14} /> Reset Step
          </button>
        </div>

        {projects.map((proj, idx) => (
          <div key={proj.id} className="repeater-card">
            <div className="repeater-card-header">
              <span>Project #{idx + 1}</span>
              <button type="button" className="btn-icon-danger" onClick={() => removeProj(idx)}>
                <Trash2 size={15} />
              </button>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="field-label">Project Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={proj.name}
                  onChange={(e) => updateProj(idx, 'name', e.target.value)}
                  placeholder="e.g., ResumeForge"
                />
              </div>
              <div className="form-group">
                <label className="field-label">Tech Stack Used</label>
                <input
                  type="text"
                  className="form-input"
                  value={proj.techStack}
                  onChange={(e) => updateProj(idx, 'techStack', e.target.value)}
                  placeholder="React.js, Node.js, Python, SQLite"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="field-label">Live Demo / GitHub Link</label>
              <input
                type="text"
                className="form-input"
                value={proj.link}
                onChange={(e) => updateProj(idx, 'link', e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>

            <BulletEditor
              bullets={proj.bullets}
              roleContext={proj.name}
              onChange={(newBullets) => updateProj(idx, 'bullets', newBullets)}
            />
          </div>
        ))}

        <button type="button" className="btn-dashed-add" onClick={addProj}>
          <Plus size={16} /> Add Project
        </button>
      </div>
    );
  };

  // Step 5: Template Selection
  const renderTemplateStep = () => {
    return (
      <div className="form-step-content fade-in">
        <div className="step-header-bar">
          <div>
            <h3>Select Resume Template</h3>
            <p className="step-subtitle">Switch templates anytime without losing your data.</p>
          </div>
        </div>
        <TemplatePicker
          selectedTemplate={resumeData.meta.template}
          onSelect={(tplId) => updateSection('meta', { ...resumeData.meta, template: tplId })}
        />
      </div>
    );
  };

  switch (currentStep) {
    case 0: return renderPersonalStep();
    case 1: return renderEducationStep();
    case 2: return renderExperienceStep();
    case 3: return renderSkillsStep();
    case 4: return renderProjectsStep();
    case 5: return renderTemplateStep();
    default: return renderPersonalStep();
  }
}
