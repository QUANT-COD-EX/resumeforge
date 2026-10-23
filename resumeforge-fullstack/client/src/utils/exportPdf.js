import html2pdf from 'html2pdf.js';

/**
 * Directly downloads the resume as a STRICT 1-PAGE A4 PDF with active clickable hyperlinks.
 * Bypasses all browser print dialogs, virtual printer drivers, and "Microsoft Print to PDF".
 * Guaranteed to produce exactly 1 page (page count === 1).
 *
 * @param {string} fullName - Candidate's full name for the file naming (e.g. Aarav_Mehta_Resume.pdf)
 * @param {object|null} resumeData - Full resume state to embed into PDF metadata for 100% lossless re-import
 * @returns {Promise<void>}
 */
export async function downloadResumePdf(fullName = 'Resume', resumeData = null) {
  const target = document.getElementById('a4-print-target');
  if (!target) {
    throw new Error('Resume print target not found.');
  }

  // Format clean filename: e.g. Aarav_Mehta_Resume.pdf
  const cleanName = (fullName || 'Resume').trim().replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_') || 'Resume';
  const filename = `${cleanName}_Resume.pdf`;

  // Find the scale wrapper to temporarily remove the preview CSS scale
  // so html2canvas captures at exact 100% 1:1 A4 resolution
  const scaleWrapper = target.closest('.a4-scale-wrapper');
  const prevTransform = scaleWrapper ? scaleWrapper.style.transform : '';
  const prevTransition = scaleWrapper ? scaleWrapper.style.transition : '';
  const prevHeight = scaleWrapper ? scaleWrapper.style.height : '';
  const prevWidth = scaleWrapper ? scaleWrapper.style.width : '';

  if (scaleWrapper) {
    scaleWrapper.style.transition = 'none';
    scaleWrapper.style.transform = 'none';
    scaleWrapper.style.width = '210mm';
    scaleWrapper.style.height = 'auto';
  }

  // Force reflow and measure unscaled height
  void target.offsetHeight;
  const unscaledHeight = target.scrollHeight;
  const a4MaxHeightPx = 1120; // 296.5mm in pixels at 96 DPI (strictly avoids subpixel spillover onto page 2)
  const fitRatio = unscaledHeight > a4MaxHeightPx ? a4MaxHeightPx / unscaledHeight : 1;

  // Save original target inline styles
  const prevTargetTransform = target.style.transform;
  const prevTargetOrigin = target.style.transformOrigin;
  const prevTargetHeight = target.style.height;
  const prevTargetMaxH = target.style.maxHeight;
  const prevTargetMinH = target.style.minHeight;
  const prevTargetOverflow = target.style.overflow;

  // If content exceeds 1 A4 page, scale it proportionally so it fits completely on 1 single page
  if (fitRatio < 1) {
    target.style.transformOrigin = 'top center';
    target.style.transform = `scale(${fitRatio.toFixed(4)})`;
    target.style.height = `${(unscaledHeight * fitRatio).toFixed(1)}px`;
    target.style.maxHeight = `${a4MaxHeightPx}px`;
    target.style.minHeight = '0px';
  } else {
    target.style.maxHeight = `${a4MaxHeightPx}px`;
    target.style.minHeight = '0px';
  }
  target.style.overflow = 'hidden';

  void target.offsetHeight;

  const opt = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: 0,
      scrollX: 0,
      width: 794,
      height: a4MaxHeightPx
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    },
    enableLinks: true
  };

  try {
    const worker = html2pdf().from(target).set(opt);

    await worker
      .toCanvas()
      .then(function clampCanvasToSingleA4() {
        const canvas = this.prop.canvas;
        const pxPageHeight = Math.floor(canvas.width * this.prop.pageSize.inner.ratio);
        // Hard clamping guarantee: ensure canvas never exceeds exactly 1 A4 page height
        if (canvas.height > pxPageHeight) {
          const clamped = document.createElement('canvas');
          clamped.width = canvas.width;
          clamped.height = pxPageHeight;
          const ctx = clamped.getContext('2d');
          ctx.drawImage(canvas, 0, 0);
          this.prop.canvas = clamped;
        }
      })
      .toPdf()
      .then(function enforceSinglePageAndMetadata() {
        const pdf = this.prop.pdf;
        // Safety guard: delete any extra page if created
        while (pdf.internal.getNumberOfPages() > 1) {
          pdf.deletePage(pdf.internal.getNumberOfPages());
        }

        // Embed lossless metadata into PDF document properties for instant re-import
        if (resumeData && typeof resumeData === 'object') {
          try {
            pdf.setProperties({
              title: `${cleanName} Resume`,
              subject: `RESUMEFORGE_METADATA:${encodeURIComponent(JSON.stringify(resumeData))}`,
              author: cleanName,
              creator: 'ResumeForge'
            });
          } catch (e) {
            console.warn('Could not embed resume metadata in PDF:', e);
          }
        }
      })
      .save();
  } finally {
    // Restore all original styles immediately
    if (scaleWrapper) {
      scaleWrapper.style.transform = prevTransform;
      scaleWrapper.style.transition = prevTransition;
      scaleWrapper.style.height = prevHeight;
      scaleWrapper.style.width = prevWidth;
    }
    target.style.transform = prevTargetTransform;
    target.style.transformOrigin = prevTargetOrigin;
    target.style.height = prevTargetHeight;
    target.style.maxHeight = prevTargetMaxH;
    target.style.minHeight = prevTargetMinH;
    target.style.overflow = prevTargetOverflow;
  }
}
