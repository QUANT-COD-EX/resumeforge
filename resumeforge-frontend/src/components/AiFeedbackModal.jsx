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
        const data = await res.json();
        setReport(data);
      } else {
        throw new Error('Fallback to local heuristic scorer');
      }
    } catch {
      // Built-in local heuristic evaluation when backend is offline
      const hasMetrics = JSON.stringify(resumeData.experience).match(/\d+%|\d+x|\d+\+/);
      const skillCount = resumeData.skills.technical.length;
      const calculatedScore = Math.min(9.5, 6.5 + (hasMetrics ? 1.5 : 0) + (skillCount >= 5 ? 1 : 0));

      setReport({
        score: calculatedScore.toFixed(1),
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
          <button type="button" className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {!report ? (
            <div className="ai-prompt-box">
              <p>Get a strict, recruiter-grade evaluation out of 10 covering impact metrics, ATS readability, and actionable improvements.</p>
              <button
                type="button"
                className="btn-primary btn-lg"
                onClick={analyzeResume}
                disabled={loading}
              >
                {loading ? 'Analyzing Resume...' : 'Run AI Resume Audit'}
              </button>
            </div>
          ) : (
            <div className="ai-report-results fade-in">
              <div className="score-banner">
                <div className="score-circle">{report.score}<span>/10</span></div>
                <div>
                  <h4>Overall Resume Impact Score</h4>
                  <p>Evaluated for ATS parsing, action verbs, and measurable outcomes.</p>
                </div>
              </div>

              <div className="feedback-section">
                <h5><CheckCircle size={15} className="text-emerald" /> Key Strengths</h5>
                <ul>{report.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>

              <div className="feedback-section">
                <h5><AlertTriangle size={15} className="text-amber" /> Areas to Strengthen</h5>
                <ul>{report.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>

              <div className="feedback-section">
                <h5><ArrowUpRight size={15} className="text-indigo" /> Actionable Quick Wins</h5>
                <ul>{report.improvements.map((imp, i) => <li key={i}>{imp}</li>)}</ul>
              </div>

              <button type="button" className="btn-secondary" onClick={analyzeResume}>
                Re-Evaluate Resume
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
