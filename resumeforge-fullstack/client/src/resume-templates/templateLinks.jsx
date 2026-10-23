import React from 'react';
import { Linkedin, Github, Globe, ExternalLink } from 'lucide-react';

export function formatUrl(url) {
  if (!url) return '';
  let trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed) && !/^mailto:/i.test(trimmed) && !/^tel:/i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

export function isGithubUrl(url) {
  if (!url) return false;
  return /github\.com/i.test(url);
}

/**
 * Renders the project title masked with the demo/live link.
 * Made as a native inline-block anchor for full PDF link annotation support.
 */
export function ProjectTitle({ proj, className = '' }) {
  if (!proj) return null;

  if (proj.link && proj.link.trim()) {
    const href = formatUrl(proj.link);
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`tpl-project-link ${className}`}
        title={`Live Demo: ${href}`}
      >
        <span className="tpl-link-label">{proj.name}</span>
        <ExternalLink size={10} className="tpl-link-icon" />
      </a>
    );
  }

  return <span>{proj.name}</span>;
}

/**
 * Renders masked LinkedIn link with logo
 */
export function LinkedInLink({ url, className = '', label = 'LinkedIn', iconSize = 12 }) {
  if (!url || !url.trim()) return null;
  const href = formatUrl(url);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`tpl-social-icon-btn ${className}`}
      title={`LinkedIn: ${href}`}
    >
      <Linkedin size={iconSize} className="tpl-link-icon" />
      <span className="tpl-link-label">{label}</span>
    </a>
  );
}

/**
 * Renders masked GitHub link with logo
 */
export function GitHubLink({ url, className = '', label = 'GitHub', iconSize = 12 }) {
  if (!url || !url.trim()) return null;
  const href = formatUrl(url);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`tpl-social-icon-btn ${className}`}
      title={`GitHub: ${href}`}
    >
      <Github size={iconSize} className="tpl-link-icon" />
      <span className="tpl-link-label">{label}</span>
    </a>
  );
}

/**
 * Renders masked Portfolio link named "Portfolio" with globe/portfolio icon
 */
export function PortfolioLink({ url, className = '', label = 'Portfolio', iconSize = 12 }) {
  if (!url || !url.trim()) return null;
  const href = formatUrl(url);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`tpl-social-icon-btn ${className}`}
      title={`Portfolio: ${href}`}
    >
      <Globe size={iconSize} className="tpl-link-icon" />
      <span className="tpl-link-label">{label}</span>
    </a>
  );
}

/**
 * Fallback helper for legacy single portfolio/github input
 */
export function GitHubOrPortfolioLink({ url, className = '', iconSize = 12 }) {
  if (!url || !url.trim()) return null;
  const isGh = isGithubUrl(url);
  return isGh
    ? <GitHubLink url={url} className={className} iconSize={iconSize} />
    : <PortfolioLink url={url} className={className} iconSize={iconSize} />;
}
