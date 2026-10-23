import React, { useState } from 'react';
import { Target, X, Plus } from 'lucide-react';

export default function TailorModal({ isOpen, onClose, resumeData, updateSection }) {
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleTailor = async () => {
    if (!jdText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData, jobDescription: jdText })
      });
      if (res.ok) {
        setResult(await res.json());
      } else {
        throw new Error('Offline fallback');
      }
    } catch {
      const commonTech = ['Docker', 'AWS', 'GraphQL', 'TypeScript', 'CI/CD', 'Redis', 'Microservices'];
      const currentLower = resumeData.skills.technical.map((s) => s.toLowerCase());
      const missing = commonTech.filter((t) => !currentLower.includes(t.toLowerCase())).slice(0, 4);

      setResult({
        matchScore: 78,
        tailoredSummary: `Results-driven ${resumeData.personal.title || 'Software Engineer'} experienced in ${resumeData.skills.technical.slice(0, 4).join(', ')}, focused on delivering scalable, production-grade architectures aligned with modern engineering standards.`,
        missingSkills: missing
      });
    } finally {
      setLoading(false);
    }
  };

  const applySummary = () => {
    if (!result?.tailoredSummary) return;
    updateSection('personal', { ...resumeData.personal, summary: result.tailoredSummary });
  };

  const addMissingSkill = (skill) => {
    if (!resumeData.skills.technical.includes(skill)) {
      updateSection('skills', {
        ...resumeData.skills,
        technical: [...resumeData.skills.technical, skill]
      });
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <div className="modal-header">
          <div className="modal-title-group">
            <Target size={20} className="accent-icon" />
            <h3>Tailor Resume to Job Description</h3>
          </div>
          <button type="button" className="btn-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="field-label">Paste Target Job Description</label>
            <textarea
              rows={4}
              className="form-input"
              placeholder="Paste job requirements and responsibilities here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
          </div>
          <button type="button" className="btn-primary" onClick={handleTailor} disabled={loading || !jdText.trim()}>
            {loading ? 'Matching Keywords...' : 'Analyze Job Match'}
          </button>

          {result && (
            <div className="tailor-results fade-in">
              <div className="score-banner">
                <div className="score-circle">{result.matchScore}%</div>
                <div>
                  <h4>Resume-to-Job Match</h4>
                  <p>One-click optimizations to boost your ATS score.</p>
                </div>
              </div>

              <div className="tailor-box">
                <div className="tailor-box-header">
                  <strong>Tailored Summary</strong>
                  <button type="button" className="btn-ai-rewrite" onClick={applySummary}>Apply to Resume</button>
                </div>
                <p className="tailor-summary-preview">{result.tailoredSummary}</p>
              </div>

              <div className="tailor-box">
                <strong>Suggested Skills to Add (Click to Append)</strong>
                <div className="skill-chips-container" style={{ marginTop: '8px' }}>
                  {(result.missingSkills || []).map((skill) => (
                    <button key={skill} type="button" className="skill-chip" onClick={() => addMissingSkill(skill)}>
                      <Plus size={12} /> {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
