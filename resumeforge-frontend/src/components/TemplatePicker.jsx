import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern',
    badge: 'Tech & Engineering',
    description: 'Dark slate sidebar with vibrant cyan accents and structured two-column hierarchy.',
    previewClass: 'thumb-modern'
  },
  {
    id: 'classic',
    name: 'Classic',
    badge: 'ATS Gold Standard',
    description: 'Timeless single-column serif layout trusted by finance, consulting, and enterprise recruiters.',
    previewClass: 'thumb-classic'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    badge: 'Clean & Spacious',
    description: 'Generous whitespace, crisp sans-serif typography, and subtle dividers that let content breathe.',
    previewClass: 'thumb-minimal'
  },
  {
    id: 'creative',
    name: 'Creative',
    badge: 'Product & Design',
    description: 'Bold violet-to-indigo gradient banner header with modern pill tags and dynamic section styling.',
    previewClass: 'thumb-creative'
  }
];

export default function TemplatePicker({ selectedTemplate, onSelect }) {
  return (
    <div className="template-picker-grid">
      {TEMPLATES.map((tpl) => {
        const isSelected = selectedTemplate === tpl.id;
        return (
          <div
            key={tpl.id}
            onClick={() => onSelect(tpl.id)}
            className={`template-card ${isSelected ? 'selected' : ''}`}
          >
            <div className={`template-thumbnail ${tpl.previewClass}`}>
              <div className="mock-header" />
              <div className="mock-body">
                <div className="mock-line short" />
                <div className="mock-line long" />
                <div className="mock-line medium" />
              </div>
            </div>
            <div className="template-card-info">
              <div className="template-card-title-row">
                <h4>{tpl.name}</h4>
                {isSelected && <CheckCircle2 size={18} className="selected-icon" />}
              </div>
              <span className="template-badge">{tpl.badge}</span>
              <p className="template-desc">{tpl.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
