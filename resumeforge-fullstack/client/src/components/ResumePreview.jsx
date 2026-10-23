import React, { useRef, useState, useEffect } from 'react';
import ModernTemplate from '../resume-templates/ModernTemplate.jsx';
import ClassicTemplate from '../resume-templates/ClassicTemplate.jsx';
import MinimalTemplate from '../resume-templates/MinimalTemplate.jsx';
import CreativeTemplate from '../resume-templates/CreativeTemplate.jsx';

export default function ResumePreview({ resumeData }) {
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(() => {
    if (typeof window === 'undefined') return 0.75;
    const isMobile = window.innerWidth <= 900;
    const availableWidth = isMobile ? window.innerWidth - 32 : (window.innerWidth * 0.54) - 48;
    return Math.min(1, Math.max(0.2, (availableWidth || 600) / 794));
  });
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const updateScale = () => {
      const isMobile = window.innerWidth <= 900;
      const padding = isMobile ? 24 : 48;
      const measured = viewportRef.current ? viewportRef.current.clientWidth : window.innerWidth;
      const containerWidth = Math.min(measured, window.innerWidth) - padding;
      const a4PixelWidth = 794;
      const calculated = Math.min(1, Math.max(0.2, containerWidth / a4PixelWidth));
      setScale(calculated);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (viewportRef.current) observer.observe(viewportRef.current);
    window.addEventListener('resize', updateScale);

    // CRITICAL FOR PRINT-TO-PDF:
    // Remove the CSS scale transform before printing so the browser PDF engine
    // calculates exact 1:1 bounding box coordinates for all clickable hyperlinks!
    const handleBeforePrint = () => {
      document.body.classList.add('is-exporting-pdf');
      setIsPrinting(true);
    };
    const handleAfterPrint = () => {
      document.body.classList.remove('is-exporting-pdf');
      setIsPrinting(false);
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
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

  const scaledWidth = Math.round(794 * scale);
  const scaledHeight = Math.round(1123 * scale);

  return (
    <div className="preview-viewport" ref={viewportRef}>
      <div
        className="a4-scale-wrapper"
        style={
          isPrinting
            ? { transform: 'none', height: 'auto', width: '210mm' }
            : {
                width: `${scaledWidth}px`,
                height: `${scaledHeight}px`,
                overflow: 'visible',
                position: 'relative'
              }
        }
      >
        <div
          id="a4-print-target"
          className="a4-sheet"
          style={
            isPrinting
              ? {}
              : {
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  width: '794px',
                  minHeight: '1123px'
                }
          }
        >
          {renderSelectedTemplate()}
        </div>
      </div>
    </div>
  );
}
