import { jsPDF } from 'jspdf';

export const openItineraryPdf = ({ title, subtitle, meta, lines, sections }) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 48;
  const headerHeight = 70;
  const marginTop = headerHeight + 24;
  const marginBottom = 56;
  const lineHeight = 16;
  let cursorY = marginTop;

  const drawHeader = () => {
    doc.setFillColor(248, 247, 244);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');
    doc.setDrawColor(201, 120, 42);
    doc.setLineWidth(1);
    doc.line(marginX, headerHeight - 1, pageWidth - marginX, headerHeight - 1);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(26, 58, 92);
    doc.text('DayOut', marginX, 38);
    doc.setTextColor(0);
  };

  drawHeader();

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

  const renderLines = (contentLines) => {
    const normalizedText = (contentLines || [])
      .filter((line) => !/^\s*-{3,}\s*$/.test(line || ''))
      .filter((line) => !/^\s*Day-by-Day Itinerary\s*:?.*$/i.test(line || ''))
      .join('\n')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

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
        drawHeader();
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(0);
        cursorY = marginTop;
      }

      if (line === '') {
        cursorY += Math.round(lineHeight * 0.6);
        return;
      }

      doc.text(line, marginX, cursorY);
      cursorY += lineHeight;
    });
  };

  if (Array.isArray(sections) && sections.length > 0) {
    sections.forEach((section, index) => {
      doc.addPage();
      drawHeader();
      cursorY = marginTop;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(section.title || 'Itinerary', marginX, cursorY);
      cursorY += 22;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      renderLines((section.items || []).map((item) => item.text));
    });
  } else {
    renderLines(lines || []);
  }

  const safeTitle = (title || 'DayOut Itinerary').replace(/[^a-z0-9-_ ]/gi, '').trim() || 'DayOut Itinerary';
  doc.save(`${safeTitle}.pdf`);
};
