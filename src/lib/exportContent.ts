import { jsPDF } from 'jspdf';
import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import { saveAs } from 'file-saver';

export const exportToPDF = (content: string, filename: string, serviceName: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  
  // Add header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(serviceName, margin, margin);
  
  // Add date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, margin + 8);
  
  // Add divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, margin + 12, pageWidth - margin, margin + 12);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Add content with word wrapping
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const lines = doc.splitTextToSize(content, maxWidth);
  let y = margin + 22;
  const lineHeight = 6;
  
  for (let i = 0; i < lines.length; i++) {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(lines[i], margin, y);
    y += lineHeight;
  }
  
  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} | PR Excellence Catalog`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`${filename}.pdf`);
};

export const exportToWord = async (content: string, filename: string, serviceName: string) => {
  // Parse content into paragraphs
  const paragraphs = content.split('\n').filter(line => line.trim() !== '');
  
  const docParagraphs = paragraphs.map(text => {
    // Check if it's a heading (starts with # or is uppercase)
    const isHeading = text.startsWith('#') || (text === text.toUpperCase() && text.length < 50);
    
    if (isHeading) {
      return new Paragraph({
        text: text.replace(/^#+\s*/, ''),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 120 },
      });
    }
    
    return new Paragraph({
      children: [
        new TextRun({
          text: text,
          size: 22, // 11pt
        }),
      ],
      spacing: { after: 120 },
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: serviceName,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 120 },
          }),
          // Date
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated: ${new Date().toLocaleDateString()}`,
                size: 20,
                color: '888888',
              }),
            ],
            spacing: { after: 300 },
          }),
          // Content
          ...docParagraphs,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
};

export const generateFilename = (serviceName: string): string => {
  const date = new Date().toISOString().split('T')[0];
  const sanitizedName = serviceName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${sanitizedName}-${date}`;
};
