import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { extractText } from 'unpdf';

export default function ImportPdfModal({ isOpen, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFile = async (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a valid PDF file.');
      return;
    }

    setFile(selectedFile);
    setErrorMsg('');
    setParsedData(null);
    setLoading(true);
    setProgressMsg('Extracting text from PDF...');

    try {
      // 1. Extract text in browser using unpdf
      const arrayBuffer = await selectedFile.arrayBuffer();
      let extractedText = '';
      try {
        const result = await extractText(arrayBuffer);
        extractedText = Array.isArray(result?.text) ? result.text.join('\n') : (result?.text || '');
      } catch (err) {
        console.warn('unpdf text extraction error, fallback to base64 upload:', err);
      }

      // 2. Convert to base64 for multimodal parsing if needed
      setProgressMsg('Analyzing resume structure & extracting details...');
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result;
          const base64Data = typeof res === 'string' ? res.split(',')[1] : '';
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      // 3. Send to API for precise structuring
      setProgressMsg('Structuring sections with AI parsing engine...');
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: extractedText,
          pdfBase64: base64
        })
      });

      if (!response.ok) {
        throw new Error('Failed to parse resume (Status: ' + response.status + ')');
      }

      const structuredResume = await response.json();
      setParsedData(structuredResume);
      setProgressMsg('');
    } catch (err) {
      console.error('PDF Import error:', err);
      setErrorMsg('Could not parse PDF. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => setDragActive(false);

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleApply = () => {
    if (!parsedData) return;
    onImport(parsedData);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setParsedData(null);
    setErrorMsg('');
    setLoading(false);
    onClose();
  };

  const expCount = parsedData?.experience?.length || 0;
  const eduCount = parsedData?.education?.length || 0;
  const skillCount = parsedData?.skills?.technical?.length || 0;
  const projCount = parsedData?.projects?.length || 0;

  return (
    <div className="modal-backdrop">
      <div className="modal-panel" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Upload size={20} className="accent-icon" style={{ color: 'var(--accent-cyan)' }} />
            <h3>Import Resume from PDF</h3>
          </div>
          <button type="button" className="btn-close" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {!parsedData && !loading && (
            <>
              <div
                className={`dropzone-container ${dragActive ? 'drag-active' : ''}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="application/pdf,.pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <div className="dropzone-icon">
                  <FileText size={24} />
                </div>
                <div className="dropzone-title">
                  {file ? file.name : 'Click to upload or drag & drop PDF'}
                </div>
                <div className="dropzone-subtitle">
                  Supports standard ATS resumes and single/multi-page PDFs
                </div>
              </div>

              {errorMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '0.82rem', marginTop: '12px' }}>
                  <AlertCircle size={16} /> {errorMsg}
                </div>
              )}
            </>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Loader2 size={36} className="animate-spin" style={{ color: 'var(--accent-cyan)', margin: '0 auto 16px' }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>
                {progressMsg || 'Processing PDF...'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {file?.name}
              </div>
            </div>
          )}

          {parsedData && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontSize: '0.86rem', fontWeight: 600, marginBottom: '14px' }}>
                <CheckCircle size={18} /> Resume parsed successfully!
              </div>

              <div className="parsed-preview-box">
                <div className="parsed-preview-title">{parsedData.personal?.fullName || 'Untitled'}</div>
                <div style={{ fontSize: '0.84rem', color: 'var(--accent-indigo)', marginBottom: '8px' }}>
                  {parsedData.personal?.title || 'Professional'}
                </div>

                <div className="parsed-preview-meta">
                  {parsedData.personal?.email && <span>📧 {parsedData.personal.email}</span>}
                  {parsedData.personal?.phone && <span>📱 {parsedData.personal.phone}</span>}
                  {parsedData.personal?.location && <span>📍 {parsedData.personal.location}</span>}
                </div>

                {parsedData.personal?.summary && (
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.45', marginBottom: '12px', borderLeft: '2px solid var(--border-subtle)', paddingLeft: '10px' }}>
                    "{parsedData.personal.summary.slice(0, 160)}..."
                  </div>
                )}

                <div className="parsed-stats-grid">
                  <div className="parsed-stat-card">
                    <div className="parsed-stat-number">{expCount}</div>
                    <div className="parsed-stat-label">Experience</div>
                  </div>
                  <div className="parsed-stat-card">
                    <div className="parsed-stat-number">{eduCount}</div>
                    <div className="parsed-stat-label">Education</div>
                  </div>
                  <div className="parsed-stat-card">
                    <div className="parsed-stat-number">{skillCount}</div>
                    <div className="parsed-stat-label">Skills</div>
                  </div>
                </div>

                {parsedData.skills?.technical?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {parsedData.skills.technical.slice(0, 8).map((s, idx) => (
                      <span key={idx} className="skill-chip" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                        {s}
                      </span>
                    ))}
                    {parsedData.skills.technical.length > 8 && (
                      <span className="skill-chip" style={{ fontSize: '0.72rem', padding: '3px 8px', color: 'var(--text-muted)' }}>
                        +{parsedData.skills.technical.length - 8} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setParsedData(null); setFile(null); }}
                >
                  Upload Different PDF
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleApply}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Sparkles size={15} /> Apply to Resume <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
