import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

export const downloadAsWord = async (title: string, content: string) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: parseContentToDocx(content)
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title}.docx`);
};

export const downloadAsPDF = (title: string, content: string) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // 한글 폰트 설정이 필요하지만, 기본 폰트로 우선 처리
  pdf.setFont('helvetica');
  
  const lines = content.split('\n');
  let y = 20;
  const lineHeight = 7;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  
  lines.forEach((line) => {
    // 페이지 넘김 체크
    if (y > pageHeight - margin) {
      pdf.addPage();
      y = 20;
    }
    
    // 제목 처리
    if (line.startsWith('**') && line.endsWith('**')) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      const text = line.replace(/\*\*/g, '');
      pdf.text(text, margin, y);
      y += lineHeight + 3;
    }
    // 섹션 헤더
    else if (line.startsWith('###')) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      const text = line.replace(/###/g, '').trim();
      pdf.text(text, margin, y);
      y += lineHeight + 2;
    }
    // 리스트 항목
    else if (line.startsWith('-')) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const text = '• ' + line.substring(1).trim();
      const splitText = pdf.splitTextToSize(text, 170);
      splitText.forEach((t: string) => {
        if (y > pageHeight - margin) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(t, margin + 5, y);
        y += lineHeight;
      });
    }
    // 구분선
    else if (line.includes('===')) {
      pdf.setDrawColor(100);
      pdf.line(margin, y, 190, y);
      y += lineHeight;
    }
    // 일반 텍스트
    else if (line.trim()) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const splitText = pdf.splitTextToSize(line, 170);
      splitText.forEach((t: string) => {
        if (y > pageHeight - margin) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(t, margin, y);
        y += lineHeight;
      });
    } else {
      y += lineHeight / 2; // 빈 줄
    }
  });
  
  pdf.save(`${title}.pdf`);
};

const parseContentToDocx = (content: string): Paragraph[] => {
  const paragraphs: Paragraph[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line) => {
    // 제목 처리
    if (line.startsWith('**') && line.endsWith('**')) {
      paragraphs.push(
        new Paragraph({
          text: line.replace(/\*\*/g, ''),
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 200 }
        })
      );
    }
    // 섹션 헤더
    else if (line.startsWith('###')) {
      paragraphs.push(
        new Paragraph({
          text: line.replace(/###/g, '').trim(),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 }
        })
      );
    }
    // 리스트 항목
    else if (line.startsWith('-')) {
      paragraphs.push(
        new Paragraph({
          text: line.substring(1).trim(),
          bullet: { level: 0 },
          spacing: { before: 50, after: 50 }
        })
      );
    }
    // 구분선은 건너뛰기
    else if (line.includes('===')) {
      // 구분선은 시각적 요소이므로 스킵
    }
    // 일반 텍스트
    else if (line.trim()) {
      paragraphs.push(
        new Paragraph({
          text: line,
          spacing: { before: 100, after: 100 }
        })
      );
    } else {
      // 빈 줄
      paragraphs.push(new Paragraph({ text: '' }));
    }
  });
  
  return paragraphs;
};
