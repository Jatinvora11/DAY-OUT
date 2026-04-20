import { jsPDF } from 'jspdf';

export const openItineraryPdf = ({ title, subtitle, meta, lines }) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 48;
  const marginTop = 56;
  const marginBottom = 56;
  const lineHeight = 16;
  let cursorY = marginTop;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(title, marginX, cursorY);
  cursorY += 22;

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(90);
    doc.text(subtitle, marginX, cursorY);
    doc.setTextColor(0);
    cursorY += 20;
  }

  if (meta && meta.length > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    meta.forEach((item) => {
      const line = `${item.label}: ${item.value}`;
      doc.text(line, marginX, cursorY);
      cursorY += 16;
    });
    cursorY += 10;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);

  const rawText = (lines || []).join('\n');
  const normalizedText = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const normalizedLines = normalizedText.length > 0
    ? normalizedText.split('\n')
    : [];

  const wrappedLines = [];
  normalizedLines.forEach((line) => {
    if (line.trim() === '') {
      wrappedLines.push('');
      return;
    }
    const wrapped = doc.splitTextToSize(line.trim(), pageWidth - marginX * 2);
    wrapped.forEach((part) => {
      const trimmed = part.trim();
      if (trimmed !== '') {
        wrappedLines.push(trimmed);
      }
    });
  });

  wrappedLines.forEach((line) => {
    if (cursorY + lineHeight > pageHeight - marginBottom) {
      doc.addPage();
      cursorY = marginTop;
    }

    if (line === '') {
      cursorY += Math.round(lineHeight * 0.6);
      return;
    }

    doc.text(line, marginX, cursorY);
    cursorY += lineHeight;
  });

  const safeTitle = (title || 'DayOut Itinerary').replace(/[^a-z0-9-_ ]/gi, '').trim() || 'DayOut Itinerary';
  doc.save(`${safeTitle}.pdf`);
};
