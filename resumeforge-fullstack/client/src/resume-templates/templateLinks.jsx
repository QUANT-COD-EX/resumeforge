import React from 'react';
import { Linkedin, Github, Globe, ExternalLink } from 'lucide-react';

export function formatUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isGithubUrl(url) {
  if (!url) return false;
  return /github\.com/i.test(url);
}

/**
 * Renders the project title masked with the demo/live link.
 * If proj.link exists, the project name itself becomes the link with an external icon.
 */
export function ProjectTitle({ proj, className = '' }) {
  if (!proj) return null;

  if (proj.link && proj.link.trim()) {
    return (
      <a
        href={formatUrl(proj.link)}
        target="_blank"
        rel="noopener noreferrer"
        className={`tpl-project-link ${className}`}
        title={`View Live Demo: ${proj.name}`}
      >
        <span>{proj.name}</span>
        <ExternalLink size={11} className="link-icon" style={{ marginLeft: '4px', verticalAlign: 'middle', display: 'inline-block' }} />
      </a>
    );
  }

  return <span>{proj.name}</span>;
}

/**
 * Renders masked LinkedIn link with logo
 */
export function LinkedInLink({ url, className = '', label = 'LinkedIn', iconSize = 13 }) {
  if (!url || !url.trim()) return null;
  return (
    <a
      href={formatUrl(url)}
      target="_blank"
      rel="noopener noreferrer"
      className={`tpl-social-icon-btn ${className}`}
      title="LinkedIn Profile"
    >
      <Linkedin size={iconSize} style={{ flexShrink: 0 }} />
      <span>{label}</span>
    </a>
  );
}

/**
 * Renders masked GitHub or Portfolio link with logo
 */
export function GitHubOrPortfolioLink({ url, className = '', iconSize = 13 }) {
  if (!url || !url.trim()) return null;
  const isGh = isGithubUrl(url);
  const Icon = isGh ? Github : Globe;
  const label = isGh ? 'GitHub' : 'Portfolio';

  return (
    <a
      href={formatUrl(url)}
      target="_blank"
      rel="noopener noreferrer"
      className={`tpl-social-icon-btn ${className}`}
      title={isGh ? 'GitHub Profile' : 'Portfolio Website'}
    >
      <Icon size={iconSize} style={{ flexShrink: 0 }} />
      <span>{label}</span>
    </a>
  );
}
