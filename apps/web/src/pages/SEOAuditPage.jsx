
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import SEOVerificationReport from '@/components/SEOVerificationReport.jsx';
import { generateSEOAuditReport } from '@/utils/seoAuditReport.js';
import { Button } from '@/components/ui/button';

const SEOAuditPage = () => {
  const [report, setReport] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const runAudit = () => {
    setIsScanning(true);
    // Small timeout to allow UI to update and simulate scanning
    setTimeout(() => {
      const newReport = generateSEOAuditReport();
      setReport(newReport);
      setIsScanning(false);
    }, 800);
  };

  useEffect(() => {
    runAudit();
  }, []);

  // Security check: Only allow in development
  if (import.meta.env.PROD) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">The SEO Audit tool is only available in development mode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1 bg-muted/30 py-12">
        <div className="container max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">SEO & Performance Audit</h1>
              <p className="text-muted-foreground mt-1">Live verification of meta tags, accessibility, and Core Web Vitals.</p>
            </div>
            <Button onClick={runAudit} disabled={isScanning} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning...' : 'Run Audit Again'}
            </Button>
          </div>

          {report ? (
            <SEOVerificationReport report={report} />
          ) : (
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-xl">
              <div className="flex flex-col items-center text-muted-foreground">
                <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                <p>Analyzing page structure...</p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SEOAuditPage;
