import React, { useState, useEffect, useRef } from 'react';
import {
  FileDown,
  FileText,
  Sparkles,
  Target,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  Loader2,
  Menu,
  X
} from 'lucide-react';
import { INITIAL_RESUME_STATE, EMPTY_SECTION_DEFAULTS } from './defaultData.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { useCompletion } from './hooks/useCompletion.js';
import StepIndicator from './components/StepIndicator.jsx';
import FormSteps from './components/FormSteps.jsx';
import ResumePreview from './components/ResumePreview.jsx';
import AiFeedbackModal from './components/AiFeedbackModal.jsx';
import TailorModal from './components/TailorModal.jsx';
import ImportPdfModal from './components/ImportPdfModal.jsx';
import { downloadResumePdf } from './utils/exportPdf.js';

export default function App() {
  const [resumeData, setResumeData] = useLocalStorage('resumeforge_v2', INITIAL_RESUME_STATE);
  const [currentStep, setCurrentStep] = useLocalStorage('resumeforge_step', 0);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isTailorOpen, setIsTailorOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [sharedBanner, setSharedBanner] = useState(null);

  const menuRef = useRef(null);
  const completion = useCompletion(resumeData);

  // Close menu on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  // Clean up legacy v1 storage key if present
  useEffect(() => {
    try {
      window.localStorage.removeItem('resumeforge_v1');
    } catch {}
  }, []);

  // Auto-load shared resume from server if ?share=rf_... is present in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share');
    if (shareId) {
      fetch(`/api/load-resume/${encodeURIComponent(shareId)}`)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((payload) => {
          if (payload?.resumeData) {
            setResumeData(payload.resumeData);
            setSharedBanner(`Viewing Shared Resume (${payload.shareId}) • Views: ${payload.viewsCount}`);
            // Remove ?share= from URL so subsequent refreshes restore local device edits
            window.history.replaceState({}, '', window.location.pathname);
          }
        })
        .catch(() => console.warn('Could not fetch shared resume ID:', shareId));
    }
  }, [setResumeData]);

  const updateSection = (sectionKey, newValue) => {
    setResumeData((prev) => ({
      ...prev,
      meta: { ...prev.meta, lastUpdated: new Date().toISOString() },
      [sectionKey]: newValue
    }));
  };

  const resetSection = (sectionKey) => {
    if (EMPTY_SECTION_DEFAULTS[sectionKey] !== undefined) {
      updateSection(sectionKey, EMPTY_SECTION_DEFAULTS[sectionKey]);
    }
  };

  /**
   * Directly downloads the PDF file with the candidate's name and preserves all clickable links.
   * Never opens the browser print dialog or triggers "Microsoft Print to PDF".
   */
  const handleDownloadPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      const candidateName = resumeData?.personal?.fullName || 'Resume';
      await downloadResumePdf(candidateName, resumeData);
      const cleanFileName = `${(candidateName).trim().replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_')}_Resume.pdf`;
      setDownloadSuccessToast(`Downloaded ${cleanFileName}`);
      setTimeout(() => setDownloadSuccessToast(null), 4000);
    } catch (err) {
      console.error('Direct PDF download error:', err);
      alert('Could not download PDF directly. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportDocx = async () => {
    try {
      const response = await fetch('/api/export-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(resumeData.personal.fullName || 'Resume').replace(/\s+/g, '_')}.docx`;
        a.click();
        return;
      }
    } catch {
      // Fallback client-side Word export if service is unavailable
    }

    const { personal, education, experience, skills, projects } = resumeData;
    const socialLinks = [
      personal.linkedin ? `<a href="${personal.linkedin}">LinkedIn</a>` : '',
      personal.github ? `<a href="${personal.github}">GitHub</a>` : '',
      personal.portfolio ? `<a href="${personal.portfolio}">Portfolio</a>` : ''
    ].filter(Boolean);
    const contactLine = [personal.title, personal.email, personal.phone, personal.location, ...socialLinks].filter(Boolean).join(' | ');

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${personal.fullName} Resume</title></head>
      <body style="font-family: Calibri, Arial, sans-serif;">
        <h1>${personal.fullName}</h1>
        <p>${contactLine}</p>
        <hr/>
        <h3>Summary</h3><p>${personal.summary}</p>
        <h3>Experience</h3>
        ${experience.map((e) => `<p><b>${e.role}</b> - ${e.company} (${e.startDate} - ${e.endDate})</p><ul>${e.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`).join('')}
        <h3>Projects</h3>
        ${projects.map((p) => `<p><b>${p.link ? `<a href="${p.link}">${p.name}</a>` : p.name}</b> (${p.techStack})</p><ul>${p.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`).join('')}
        <h3>Education</h3>
        ${education.map((ed) => `<p><b>${ed.degree}</b>, ${ed.institution} (${ed.startDate} - ${ed.endDate}) — GPA: ${ed.gpa}</p>`).join('')}
        <h3>Skills</h3>
        <p>${[...skills.technical, ...skills.tools, ...skills.soft].join(', ')}</p>
      </body></html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${(personal.fullName || 'Resume').replace(/\s+/g, '_')}.doc`;
    link.click();
  };

  const handleShareLink = async () => {
    try {
      const res = await fetch('/api/share-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData })
      });
      if (res.ok) {
        const { shareUrl } = await res.json();
        await navigator.clipboard.writeText(shareUrl);
      } else {
        throw new Error('Fallback share');
      }
    } catch {
      await navigator.clipboard.writeText(window.location.href);
    }
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const handleImportParsedResume = (importedData) => {
    if (!importedData) return;
    setResumeData(importedData);
    setCurrentStep(0); // Return to personal step to see imported info
  };

  return (
    <div className="app-shell">
      <header className="top-navbar no-print">
        <div className="brand-logo">
          <div className="brand-orb" />
          <span className="brand-title">Resume<span>Forge</span></span>
          <span className="autosave-pill">✓ Autosaved</span>
          {sharedBanner && <span className="autosave-pill" style={{ color: '#38bdf8' }}>{sharedBanner}</span>}
        </div>

        <div className="menu-container" ref={menuRef}>
          <button
            type="button"
            className={`btn-menu-trigger ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle menu bar"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            <span className="menu-trigger-text">{isMenuOpen ? 'Close' : 'Menu'}</span>
          </button>

          {isMenuOpen && (
            <>
              <div className="menu-backdrop-overlay" onClick={() => setIsMenuOpen(false)} />
              <div className="menu-dropdown" role="menu">
              <div className="menu-section-label">Actions & Tools</div>

              <button
                type="button"
                className="menu-item menu-item-primary"
                disabled={isExportingPdf}
                onClick={() => {
                  setIsMenuOpen(false);
                  handleDownloadPdf();
                }}
              >
                <div className="menu-item-icon">
                  {isExportingPdf ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                </div>
                <div className="menu-item-text">
                  <div className="menu-item-title">Export PDF</div>
                  <div className="menu-item-desc">Direct download strict 1-page PDF with links</div>
                </div>
              </button>

              <button
                type="button"
                className="menu-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsImportOpen(true);
                }}
              >
                <div className="menu-item-icon" style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)' }}>
                  <Upload size={16} />
                </div>
                <div className="menu-item-text">
                  <div className="menu-item-title">Import PDF</div>
                  <div className="menu-item-desc">Auto-fill all fields from existing resume</div>
                </div>
              </button>

              <button
                type="button"
                className="menu-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsAiOpen(true);
                }}
              >
                <div className="menu-item-icon" style={{ color: '#c084fc', background: 'rgba(192, 132, 252, 0.12)' }}>
                  <Sparkles size={16} />
                </div>
                <div className="menu-item-text">
                  <div className="menu-item-title">AI Review</div>
                  <div className="menu-item-desc">ATS score, strengths, and improvements</div>
                </div>
              </button>

              <button
                type="button"
                className="menu-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsTailorOpen(true);
                }}
              >
                <div className="menu-item-icon" style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)' }}>
                  <Target size={16} />
                </div>
                <div className="menu-item-text">
                  <div className="menu-item-title">Tailor to JD</div>
                  <div className="menu-item-desc">Match keywords against job description</div>
                </div>
              </button>

              <div className="menu-divider" />

              <button
                type="button"
                className="menu-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleExportDocx();
                }}
              >
                <div className="menu-item-icon">
                  <FileText size={16} />
                </div>
                <div className="menu-item-text">
                  <div className="menu-item-title">DOCX</div>
                  <div className="menu-item-desc">Download editable Microsoft Word document</div>
                </div>
              </button>

              <button
                type="button"
                className="menu-item"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleShareLink();
                }}
              >
                <div className="menu-item-icon" style={{ color: shareCopied ? '#10b981' : undefined }}>
                  {shareCopied ? <Check size={16} /> : <Share2 size={16} />}
                </div>
                <div className="menu-item-text">
                  <div className="menu-item-title">{shareCopied ? 'Link Copied!' : 'Share'}</div>
                  <div className="menu-item-desc">Copy public share link for any device</div>
                </div>
              </button>
            </div>
          </>
        )}
        </div>
      </header>

      <div className="workspace-split">
        <section className="editor-pane no-print">
          <StepIndicator currentStep={currentStep} setCurrentStep={setCurrentStep} completion={completion} />
          <div className="form-scroll-container">
            <FormSteps
              currentStep={currentStep}
              resumeData={resumeData}
              updateSection={updateSection}
              resetSection={resetSection}
            />
          </div>
          <footer className="step-footer-nav">
            <button
              type="button"
              className="btn-secondary"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="step-counter">Step {currentStep + 1} of 6</span>
            <button
              type="button"
              className="btn-primary"
              disabled={currentStep === 5}
              onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
            >
              Next Step <ChevronRight size={16} />
            </button>
          </footer>
        </section>

        <section className="preview-pane">
          <div className="preview-section-header">
            <Sparkles size={14} /> Live A4 Resume Preview
          </div>
          <ResumePreview resumeData={resumeData} />
        </section>
      </div>

      <ImportPdfModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportParsedResume}
      />
      <AiFeedbackModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} resumeData={resumeData} />
      <TailorModal isOpen={isTailorOpen} onClose={() => setIsTailorOpen(false)} resumeData={resumeData} updateSection={updateSection} />

      {/* Direct Download Toast */}
      {downloadSuccessToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0f172a',
            border: '1px solid #10b981',
            borderRadius: '8px',
            padding: '12px 18px',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 9999,
            fontSize: '0.85rem'
          }}
        >
          <Check size={18} style={{ color: '#10b981' }} />
          <span>
            {downloadSuccessToast} with clickable hyperlinks!
          </span>
        </div>
      )}
    </div>
  );
}
