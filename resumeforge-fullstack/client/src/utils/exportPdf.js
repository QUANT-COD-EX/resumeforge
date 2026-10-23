import html2pdf from 'html2pdf.js';

/**
 * Directly generates and downloads the resume as an A4 PDF with active clickable hyperlinks.
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

  // Format filename cleanly
  const cleanName = (fullName || 'Resume').trim().replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_') || 'Resume';
  const filename = `${cleanName}_Resume.pdf`;

  // Create an unscaled off-screen staging container at exact A4 proportions (210mm x 297mm)
  const staging = document.createElement('div');
  staging.setAttribute(
    'style',
    'position: fixed; left: 0; top: 0; width: 210mm; min-height: 297mm; z-index: -9999; background: #ffffff; margin: 0; padding: 0; overflow: visible;'
  );

  // Deep clone the target so we capture exact unscaled layout and styles
  const clone = target.cloneNode(true);
  clone.style.width = '210mm';
  clone.style.minHeight = '297mm';
  clone.style.boxShadow = 'none';
  clone.style.margin = '0';
  clone.style.transform = 'none';
  clone.style.transition = 'none';
  clone.style.overflow = 'visible';

  staging.appendChild(clone);
  document.body.appendChild(staging);

  const opt = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794 // 210mm in pixels at 96 DPI
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    },
    enableLinks: true
  };

  try {
    await html2pdf().from(staging).set(opt).save();
  } finally {
    if (staging.parentNode) {
      staging.parentNode.removeChild(staging);
    }
  }
}
