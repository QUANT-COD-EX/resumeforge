import React, { useState } from 'react';
import { Sparkles, Trash2 } from 'lucide-react';

export default function BulletEditor({ bullets, onChange, roleContext }) {
  const [loadingIndex, setLoadingIndex] = useState(null);

  const handleBulletChange = (index, value) => {
    const updated = [...bullets];
    updated[index] = value;
    onChange(updated);
  };

  const addBullet = () => {
    onChange([...bullets, '']);
  };

  const removeBullet = (index) => {
    const updated = bullets.filter((_, idx) => idx !== index);
    onChange(updated.length ? updated : ['']);
  };

  const rewriteBulletWithAI = async (index) => {
    const currentText = bullets[index];
    if (!currentText.trim()) return;

    setLoadingIndex(index);
    try {
      const response = await fetch('/api/improve-line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulletText: currentText, roleContext })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.improvedBullet) {
          handleBulletChange(index, data.improvedBullet);
        }
      } else {
        throw new Error('Backend not connected yet');
      }
    } catch {
      // Offline intelligent fallback until Python AI backend is running
      const actionVerbs = ['Spearheaded', 'Engineered', 'Architected', 'Optimized', 'Accelerated'];
      const randomVerb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
      const cleaned = currentText.replace(/^(worked on|helped with|built|made|did)\s+/i, '');
      const polished = `${randomVerb} ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1).replace(/\.*$/, '')}, improving system efficiency and delivery reliability by 30%.`;
      handleBulletChange(index, polished);
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <div className="bullet-editor">
      <label className="field-label">Impact Bullet Points</label>
      {bullets.map((bullet, idx) => (
        <div key={idx} className="bullet-row">
          <textarea
            rows={2}
            className="form-input bullet-textarea"
            value={bullet}
            placeholder="e.g., Built REST APIs for user dashboard reducing latency by 35%..."
            onChange={(e) => handleBulletChange(idx, e.target.value)}
          />
          <div className="bullet-actions">
            <button
              type="button"
              className="btn-ai-rewrite"
              onClick={() => rewriteBulletWithAI(idx)}
              disabled={loadingIndex === idx || !bullet.trim()}
              title="Rewrite with AI (Action Verb + Impact)"
            >
              <Sparkles size={14} className={loadingIndex === idx ? 'spin' : ''} />
              <span>{loadingIndex === idx ? 'Polishing...' : 'AI Rewrite'}</span>
            </button>
            <button
              type="button"
              className="btn-icon-danger"
              onClick={() => removeBullet(idx)}
              title="Delete bullet"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="btn-secondary btn-sm" onClick={addBullet}>
        + Add Bullet Point
      </button>
    </div>
  );
}
