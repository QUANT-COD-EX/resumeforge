import React, { useRef, useState, useEffect } from 'react';
import ModernTemplate from '../resume-templates/ModernTemplate.jsx';
import ClassicTemplate from '../resume-templates/ClassicTemplate.jsx';
import MinimalTemplate from '../resume-templates/MinimalTemplate.jsx';
import CreativeTemplate from '../resume-templates/CreativeTemplate.jsx';

export default function ResumePreview({ resumeData }) {
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(0.75);

  useEffect(() => {
    const updateScale = () => {
      if (!viewportRef.current) return;
      const containerWidth = viewportRef.current.clientWidth - 48;
      const a4PixelWidth = 794;
      const calculated = Math.min(1, Math.max(0.38, containerWidth / a4PixelWidth));
      setScale(calculated);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (viewportRef.current) observer.observe(viewportRef.current);
    window.addEventListener('resize', updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  const renderSelectedTemplate = () => {
    switch (resumeData.meta.template) {
      case 'modern': return <ModernTemplate data={resumeData} />;
      case 'classic': return <ClassicTemplate data={resumeData} />;
      case 'minimal': return <MinimalTemplate data={resumeData} />;
      case 'creative': return <CreativeTemplate data={resumeData} />;
      default: return <ModernTemplate data={resumeData} />;
    }
  };

  return (
    <div className="preview-viewport" ref={viewportRef}>
      <div
        className="a4-scale-wrapper"
        style={{ transform: `scale(${scale})`, height: `${1123 * scale}px` }}
      >
        <div id="a4-print-target" className="a4-sheet">
          {renderSelectedTemplate()}
        </div>
      </div>
    </div>
  );
}
