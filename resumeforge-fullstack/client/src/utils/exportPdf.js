import html2pdf from 'html2pdf.js';

/**
 * Directly downloads the resume as an A4 PDF with active clickable hyperlinks.
 * Bypasses all browser print dialogs, virtual printer drivers, and "Microsoft Print to PDF".
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
  // so html2canvas captures at exact 100% 1:1 A4 resolution (not shrunk down)
  const scaleWrapper = target.closest('.a4-scale-wrapper');
  const prevTransform = scaleWrapper ? scaleWrapper.style.transform : '';
  const prevTransition = scaleWrapper ? scaleWrapper.style.transition : '';
  const prevHeight = scaleWrapper ? scaleWrapper.style.height : '';

  if (scaleWrapper) {
    scaleWrapper.style.transition = 'none';
    scaleWrapper.style.transform = 'none';
    scaleWrapper.style.height = 'auto';
  }

  // Force synchronous layout recalculation
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
    // Generate and directly trigger browser file download
    await html2pdf().from(target).set(opt).save();
  } finally {
    // Restore preview scaling immediately
    if (scaleWrapper) {
      scaleWrapper.style.transform = prevTransform;
      scaleWrapper.style.transition = prevTransition;
      scaleWrapper.style.height = prevHeight;
    }
  }
}
