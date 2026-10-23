import html2pdf from 'html2pdf.js';

/**
 * Directly downloads the resume as a STRICT 1-PAGE A4 PDF with active clickable hyperlinks.
 * Bypasses all browser print dialogs, virtual printer drivers, and "Microsoft Print to PDF".
 * Guaranteed to produce exactly 1 page (page count === 1).
 *
 * @param {string} fullName - Candidate's full name for the file naming (e.g. Aarav_Mehta_Resume.pdf)
 * @returns {Promise<void>}
 */
export async function downloadResumePdf(fullName = 'Resume') {
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

  if (scaleWrapper) {
    scaleWrapper.style.transition = 'none';
    scaleWrapper.style.transform = 'none';
    scaleWrapper.style.height = 'auto';
  }

  // Measure actual content height
  void target.offsetHeight;
  const contentHeight = target.scrollHeight;
  const a4MaxHeightPx = 1120; // 296.5mm in pixels at 96 DPI (strictly avoids subpixel spillover onto page 2)

  // If content is longer than 1 standard A4 sheet, scale it so everything fits strictly on 1 page
  const fitRatio = contentHeight > a4MaxHeightPx ? a4MaxHeightPx / contentHeight : 1;
  if (fitRatio < 1) {
    target.style.transformOrigin = 'top center';
    target.style.transform = `scale(${fitRatio.toFixed(4)})`;
  }

  // Lock target boundaries strictly to 1 A4 page height
  const prevTargetHeight = target.style.height;
  const prevTargetMaxH = target.style.maxHeight;
  const prevTargetOverflow = target.style.overflow;
  target.style.height = '296.5mm';
  target.style.maxHeight = '296.5mm';
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
      scrollX: 0
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
    const pdf = await worker.toPdf().get('pdf');

    // STRICT GUARANTEE: If any subpixel rounding generated an extra page, delete it immediately
    while (pdf.internal.getNumberOfPages() > 1) {
      pdf.deletePage(pdf.internal.getNumberOfPages());
    }

    // Directly save and trigger browser download
    pdf.save(filename);
  } finally {
    // Restore all original styles immediately
    if (scaleWrapper) {
      scaleWrapper.style.transform = prevTransform;
      scaleWrapper.style.transition = prevTransition;
      scaleWrapper.style.height = prevHeight;
    }
    target.style.transform = '';
    target.style.transformOrigin = '';
    target.style.height = prevTargetHeight;
    target.style.maxHeight = prevTargetMaxH;
    target.style.overflow = prevTargetOverflow;
  }
}
