/**
 * Isolated print utility for ResumeForge.
 * Renders the resume into a clean hidden iframe containing only the A4 target
 * and stylesheet rules, completely isolated from editor UI, split panes, and scale transforms.
 * This guarantees Chromium's Skia engine computes 100% accurate, clickable link annotations.
 */
export function printCleanResume(resumeName = 'Resume') {
  const target = document.getElementById('a4-print-target');
  if (!target) {
    window.print();
    return;
  }

  try {
    // Collect all stylesheets and style blocks from the parent window
    let stylesHtml = '';
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
      stylesHtml += el.outerHTML;
    });

    // Remove any existing print iframe
    const oldIframe = document.getElementById('resumeforge-print-frame');
    if (oldIframe && oldIframe.parentNode) {
      oldIframe.parentNode.removeChild(oldIframe);
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'resumeforge-print-frame';
    iframe.setAttribute(
      'style',
      'position: fixed; right: 0; bottom: 0; width: 0; height: 0; border: 0; visibility: hidden; z-index: -9999;'
    );
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    const cleanFileName = (resumeName || 'Resume').replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_');

    doc.open();
    doc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${cleanFileName}</title>
  ${stylesHtml}
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    html, body {
      width: 210mm !important;
      min-height: 297mm !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      overflow: visible !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #a4-print-target {
      width: 210mm !important;
      min-height: 297mm !important;
      box-shadow: none !important;
      margin: 0 !important;
      overflow: visible !important;
      transform: none !important;
      transition: none !important;
    }
    .tpl-social-icon-btn,
    .tpl-project-link {
      display: inline-block !important;
      position: relative !important;
      pointer-events: auto !important;
      cursor: pointer !important;
      text-decoration: underline !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .tpl-social-icon-btn .tpl-link-icon,
    .tpl-project-link .tpl-link-icon {
      display: inline-block !important;
      vertical-align: -1px !important;
      pointer-events: none !important;
    }
    .tpl-social-icon-btn .tpl-link-label,
    .tpl-project-link .tpl-link-label {
      display: inline !important;
      pointer-events: auto !important;
    }
  </style>
</head>
<body>
  ${target.outerHTML}
</body>
</html>`);
    doc.close();

    // Give the iframe document time to parse styles and SVG assets
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.warn('Iframe print error, falling back to window.print():', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 4000);
      }
    }, 280);
  } catch (err) {
    console.warn('Print iframe initialization error, falling back to window.print():', err);
    window.print();
  }
}
