
import html2pdf from 'html2pdf.js';

export const downloadReportPDF = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  // Add a temporary class to ensure white background and black text for PDF
  element.classList.add('pdf-export-mode');
  
  // Force light theme colors for the export
  const originalBg = element.style.backgroundColor;
  const originalColor = element.style.color;
  element.style.backgroundColor = '#ffffff';
  element.style.color = '#000000';

  const opt = {
    margin:       10,
    filename:     filename || 'report.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    // Restore original styles
    element.classList.remove('pdf-export-mode');
    element.style.backgroundColor = originalBg;
    element.style.color = originalColor;
  }
};
