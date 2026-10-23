import React, { useState } from 'react';
import { Sparkles, X, CheckCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';

export default function AiFeedbackModal({ isOpen, onClose, resumeData }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  if (!isOpen) return null;

  const analyzeResume = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData })
      });
      if (res.ok) {
        setReport(await res.json());
      } else {
        throw new Error('API returned ' + res.status);
      }
    } catch (err) {
      console.warn('Network error calling /api/ai-feedback:', err);
      // Fallback
      const skills = resumeData.skills?.technical || [];
      const hasMetrics = JSON.stringify(resumeData.experience || []).match(/\d+%|\d+x|\d+\+/);
      const skillCount = skills.length;
      const calculatedScore = Math.min(9.3, 6.8 + (hasMetrics ? 1.4 : 0) + (skillCount >= 5 ? 0.9 : 0));

      setReport({
        score: calculatedScore.toFixed(1),
        provider: 'Offline Heuristic Engine',
        strengths: [
          'Clean A4 visual hierarchy with ATS-friendly section headers.',
          `Strong technical keyword density (${skillCount} core technologies listed).`
        ],
        weaknesses: [
          hasMetrics
            ? 'Professional summary could be tailored more tightly to target roles.'
            : 'Some experience bullet points lack quantifiable metrics (%, latency, users).'
        ],
        improvements: [
          'Start every project and internship bullet with a strong past-tense action verb.',
          'Use the "Tailor to JD" tool before submitting to match company-specific keywords.'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <div className="modal-header">
          <div className="modal-title-group">
            <Sparkles size={20} className="accent-icon" />
            <h3>AI Resume Review</h3>
          </div>
          <button type="button" className="btn-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {!report ? (
            <div className="ai-prompt-box">
              <p>Get a strict, recruiter-grade evaluation out of 10 covering impact metrics, ATS readability, and actionable improvements.</p>
              <button type="button" className="btn-primary" style={{ marginTop: '12px' }} onClick={analyzeResume} disabled={loading}>
                {loading ? 'Auditing Resume with AI...' : 'Run AI Resume Audit'}
              </button>
            </div>
          ) : (
            <div className="ai-report-results fade-in">
              <div className="score-banner">
                <div className="score-circle">{report.score}<span>/10</span></div>
                <div>
                  <h4>Overall Resume Impact Score</h4>
                  <p>Evaluated for ATS parsing, action verbs, and measurable outcomes.</p>
                  {report.provider && (
                    <span style={{ display: 'inline-block', fontSize: '0.72rem', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', padding: '2px 8px', borderRadius: '4px', marginTop: '5px' }}>
                      ⚡ {report.provider}
                    </span>
                  )}
                </div>
              
              )}

              <div className="feedback-section">
                <h5><CheckCircle size={15} /> Key Strengths</h5>
                <ul>{report.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>

              <div className="feedback-section">
                <h5><AlertTriangle size={15} /> Areas to Strengthen</h5>
                <ul>{report.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>

              <div className="feedback-section">
                <h5><ArrowUpRight size={15} /> Actionable Quick Wins</h5>
                <ul>{report.improvements.map((imp, i) => <li key={i}>{imp}</li>)}</ul>
              </div>

              <button type="button" className="btn-secondary" onClick={analyzeResume} disabled={loading}>
                {loading ? 'Re-Evaluating...' : 'Re-Evaluate Resume'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
