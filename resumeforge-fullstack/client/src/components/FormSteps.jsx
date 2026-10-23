import React, { useState } from 'react';
import { RotateCcw, Plus, Trash2 } from 'lucide-react';
import BulletEditor from './BulletEditor.jsx';
import TemplatePicker from './TemplatePicker.jsx';

export default function FormSteps({ currentStep, resumeData, updateSection, resetSection }) {
  const [skillInputs, setSkillInputs] = useState({ technical: '', tools: '', soft: '' });

  const renderPersonalStep = () => {
    const { personal } = resumeData;
    const handleChange = (field, value) => updateSection('personal', { ...personal, [field]: value });

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
            <input type="text" className="form-input" value={personal.fullName} onChange={(e) => handleChange('fullName', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="field-label">Professional Title</label>
            <input type="text" className="form-input" value={personal.title} onChange={(e) => handleChange('title', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="field-label">Email Address</label>
            <input type="email" className="form-input" value={personal.email} onChange={(e) => handleChange('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="field-label">Phone Number</label>
            <input type="tel" className="form-input" value={personal.phone} onChange={(e) => handleChange('phone', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="field-label">Location</label>
            <input type="text" className="form-input" value={personal.location} onChange={(e) => handleChange('location', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="field-label">LinkedIn URL</label>
            <input type="text" className="form-input" value={personal.linkedin} onChange={(e) => handleChange('linkedin', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="field-label">GitHub / Portfolio Link</label>
          <input type="text" className="form-input" value={personal.portfolio} onChange={(e) => handleChange('portfolio', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="field-label">Professional Summary</label>
          <textarea rows={4} className="form-input" value={personal.summary} onChange={(e) => handleChange('summary', e.target.value)} />
        </div>
      </div>
    );
  };

  const renderEducationStep = () => {
    const { education } = resumeData;
    const updateEdu = (idx, field, val) => {
      const copy = [...education];
      copy[idx] = { ...copy[idx], [field]: val };
      updateSection('education', copy);
    };
    const addEdu = () => updateSection('education', [...education, { id: `edu-${Date.now()}`, institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }]);
    const removeEdu = (idx) => updateSection('education', education.filter((_, i) => i !== idx));

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
              <button type="button" className="btn-icon-danger" onClick={() => removeEdu(idx)}><Trash2 size={15} /></button>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="field-label">Institution</label>
                <input type="text" className="form-input" value={edu.institution} onChange={(e) => updateEdu(idx, 'institution', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="field-label">Degree</label>
                <input type="text" className="form-input" value={edu.degree} onChange={(e) => updateEdu(idx, 'degree', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="field-label">Start Year</label>
                <input type="text" className="form-input" value={edu.startDate} onChange={(e) => updateEdu(idx, 'startDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="field-label">End Year</label>
                <input type="text" className="form-input" value={edu.endDate} onChange={(e) => updateEdu(idx, 'endDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="field-label">CGPA / Score</label>
                <input type="text" className="form-input" value={edu.gpa} onChange={(e) => updateEdu(idx, 'gpa', e.target.value)} />
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="btn-dashed-add" onClick={addEdu}><Plus size={16} /> Add Education Entry</button>
      </div>
    );
  };

  const renderExperienceStep = () => {
    const { experience } = resumeData;
    const updateExp = (idx, field, val) => {
      const copy = [...experience];
      copy[idx] = { ...copy[idx], [field]: val };
      updateSection('experience', copy);
    };
    const addExp = () => updateSection('experience', [...experience, { id: `exp-${Date.now()}`, company: '', role: '', startDate: '', endDate: '', current: false, bullets: [''] }]);
    const removeExp = (idx) => updateSection('experience', experience.filter((_, i) => i !== idx));

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
              <button type="button" className="btn-icon-danger" onClick={() => removeExp(idx)}><Trash2 size={15} /></button>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="field-label">Company</label>
                <input type="text" className="form-input" value={exp.company} onChange={(e) => updateExp(idx, 'company', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="field-label">Role Title</label>
                <input type="text" className="form-input" value={exp.role} onChange={(e) => updateExp(idx, 'role', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="field-label">Start Date</label>
                <input type="text" className="form-input" value={exp.startDate} onChange={(e) => updateExp(idx, 'startDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="field-label">End Date</label>
                <input type="text" className="form-input" value={exp.endDate} onChange={(e) => updateExp(idx, 'endDate', e.target.value)} />
              </div>
            </div>
            <BulletEditor bullets={exp.bullets} roleContext={exp.role} onChange={(b) => updateExp(idx, 'bullets', b)} />
          </div>
        ))}
        <button type="button" className="btn-dashed-add" onClick={addExp}><Plus size={16} /> Add Work Experience</button>
      </div>
    );
  };

  const renderSkillsStep = () => {
    const { skills } = resumeData;
    const addSkill = (cat) => {
      const val = skillInputs[cat].trim();
      if (!val) return;
      if (!skills[cat].includes(val)) {
        updateSection('skills', { ...skills, [cat]: [...skills[cat], val] });
      }
      setSkillInputs({ ...skillInputs, [cat]: '' });
    };
    const removeSkill = (cat, item) => updateSection('skills', { ...skills, [cat]: skills[cat].filter((s) => s !== item) });

    const cats = [
      { key: 'technical', label: 'Languages & Frameworks', placeholder: 'e.g., React.js, Python, C++ (Press Enter)' },
      { key: 'tools', label: 'Developer Tools & Platforms', placeholder: 'e.g., Git, Docker, SQLite, Linux' },
      { key: 'soft', label: 'Core Competencies & Soft Skills', placeholder: 'e.g., Team Leadership, Agile' }
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
        {cats.map((c) => (
          <div key={c.key} className="repeater-card">
            <label className="field-label">{c.label}</label>
            <div className="skill-input-row">
              <input
                type="text"
                className="form-input"
                value={skillInputs[c.key]}
                placeholder={c.placeholder}
                onChange={(e) => setSkillInputs({ ...skillInputs, [c.key]: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(c.key); } }}
              />
              <button type="button" className="btn-primary" onClick={() => addSkill(c.key)}>Add</button>
            </div>
            <div className="skill-chips-container">
              {skills[c.key].map((s) => (
                <span key={s} className="skill-chip">
                  {s}
                  <button type="button" onClick={() => removeSkill(c.key, s)}>×</button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderProjectsStep = () => {
    const { projects } = resumeData;
    const updateProj = (idx, field, val) => {
      const copy = [...projects];
      copy[idx] = { ...copy[idx], [field]: val };
      updateSection('projects', copy);
    };
    const addProj = () => updateSection('projects', [...projects, { id: `proj-${Date.now()}`, name: '', techStack: '', link: '', bullets: [''] }]);
    const removeProj = (idx) => updateSection('projects', projects.filter((_, i) => i !== idx));

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
              <button type="button" className="btn-icon-danger" onClick={() => removeProj(idx)}><Trash2 size={15} /></button>
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="field-label">Project Name</label>
                <input type="text" className="form-input" value={proj.name} onChange={(e) => updateProj(idx, 'name', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="field-label">Tech Stack</label>
                <input type="text" className="form-input" value={proj.techStack} onChange={(e) => updateProj(idx, 'techStack', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="field-label">Live Demo / GitHub Link</label>
              <input type="text" className="form-input" value={proj.link} onChange={(e) => updateProj(idx, 'link', e.target.value)} />
            </div>
            <BulletEditor bullets={proj.bullets} roleContext={proj.name} onChange={(b) => updateProj(idx, 'bullets', b)} />
          </div>
        ))}
        <button type="button" className="btn-dashed-add" onClick={addProj}><Plus size={16} /> Add Project</button>
      </div>
    );
  };

  const renderTemplateStep = () => (
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
