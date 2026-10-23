import React from 'react';
import { User, GraduationCap, Briefcase, Wrench, FolderGit2, Palette } from 'lucide-react';

const STEPS = [
  { id: 0, label: 'Personal', icon: User },
  { id: 1, label: 'Education', icon: GraduationCap },
  { id: 2, label: 'Experience', icon: Briefcase },
  { id: 3, label: 'Skills', icon: Wrench },
  { id: 4, label: 'Projects', icon: FolderGit2 },
  { id: 5, label: 'Templates', icon: Palette }
];

export default function StepIndicator({ currentStep, setCurrentStep, completion }) {
  return (
    <div className="step-indicator-wrapper">
      <div className="completion-header">
        <span className="completion-label">Resume Completeness</span>
        <span className="completion-badge">{completion}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${completion}%` }} />
      </div>

      <div className="steps-nav" role="tablist">
        {STEPS.map((step) => {
          const IconComponent = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setCurrentStep(step.id)}
              className={`step-tab ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <div className="step-icon-circle">
                <IconComponent size={16} />
              </div>
              <span className="step-tab-label">{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
