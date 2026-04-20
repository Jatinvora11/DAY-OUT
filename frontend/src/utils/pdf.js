export const openItineraryPdf = ({ title, subtitle, meta, lines }) => {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer');

  if (!printWindow) {
    window.alert('Popup blocked. Please allow popups to download the PDF.');
    return;
  }

  const metaRows = (meta || [])
    .map((item) => `<div class="meta-row"><span>${item.label}</span><strong>${item.value}</strong></div>`)
    .join('');

  const bodyLines = (lines || [])
    .filter((line) => line.trim() !== '')
    .map((line) => `<p>${line}</p>`)
    .join('');

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      :root {
        color-scheme: light;
      }
      body {
        font-family: Arial, sans-serif;
        margin: 32px;
        color: #1b1b1b;
      }
      h1 {
        margin: 0 0 6px 0;
        font-size: 24px;
      }
      .subtitle {
        margin: 0 0 20px 0;
        color: #5c5c5c;
        font-size: 14px;
      }
      .meta {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 10px 16px;
        margin-bottom: 20px;
        padding: 12px 14px;
        background: #f6f6f6;
        border-radius: 10px;
      }
      .meta-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 13px;
        color: #404040;
      }
      .content p {
        margin: 0 0 10px 0;
        line-height: 1.5;
      }
      @media print {
        body {
          margin: 20px;
        }
      }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
    ${metaRows ? `<div class="meta">${metaRows}</div>` : ''}
    <div class="content">${bodyLines}</div>
  </body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
};
