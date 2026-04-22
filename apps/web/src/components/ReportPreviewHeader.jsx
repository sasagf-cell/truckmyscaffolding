
import React, { useState } from 'react';
import { Printer, Download, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadReportPDF } from '@/lib/downloadReportPDF.js';
import EmailModal from '@/components/EmailModal.jsx';

const ReportPreviewHeader = ({ project, reportType, date }) => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    const filename = `${project.name.replace(/\s+/g, '_')}_${reportType}_Report_${date}.pdf`;
    await downloadReportPDF('report-content', filename);
    setIsDownloading(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 bg-muted/30 rounded-lg border border-border print:hidden">
        <div>
          <h2 className="text-lg font-semibold">Report Preview</h2>
          <p className="text-sm text-muted-foreground">
            {reportType === 'daily' ? 'Daily' : 'Monthly'} Report • {date}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={isDownloading}>
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? 'Generating...' : 'Download PDF'}
          </Button>
          <Button size="sm" onClick={() => setIsEmailModalOpen(true)}>
            <Mail className="w-4 h-4 mr-2" />
            Send by Email
          </Button>
        </div>
      </div>

      <EmailModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)}
        projectId={project.id}
        projectName={project.name}
        reportType={reportType}
        date={date}
      />
    </>
  );
};

export default ReportPreviewHeader;
