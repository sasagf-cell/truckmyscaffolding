
import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

const StatusIcon = ({ passed, hasWarnings }) => {
  if (!passed) return <XCircle className="w-5 h-5 text-destructive" />;
  if (hasWarnings) return <AlertTriangle className="w-5 h-5 text-warning" />;
  return <CheckCircle2 className="w-5 h-5 text-success" />;
};

const SEOVerificationReport = ({ report }) => {
  if (!report) return null;

  const categories = [
    { key: 'metaTags', label: 'Meta Tags & Head' },
    { key: 'schemaMarkup', label: 'JSON-LD Schema' },
    { key: 'images', label: 'Image Optimization' },
    { key: 'accessibility', label: 'Accessibility (A11y)' },
    { key: 'mobileOptimization', label: 'Mobile Responsiveness' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary">{report.summary.passedCategories}/{report.summary.totalCategories}</div>
            <p className="text-sm text-muted-foreground mt-1">Categories Passed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-destructive">{report.summary.totalIssues}</div>
            <p className="text-sm text-muted-foreground mt-1">Total Issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-warning">{report.summary.totalWarnings}</div>
            <p className="text-sm text-muted-foreground mt-1">Total Warnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-sm font-medium truncate px-2" title={report.url}>{new URL(report.url).pathname}</div>
            <p className="text-xs text-muted-foreground mt-1">Audited URL</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Audit Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {categories.map(({ key, label }) => {
              const data = report.categories[key];
              const hasWarnings = data.warnings.length > 0;
              
              return (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <StatusIcon passed={data.passed} hasWarnings={hasWarnings} />
                      <span className="font-semibold">{label}</span>
                      <div className="flex gap-2 ml-4">
                        {data.issues.length > 0 && (
                          <Badge variant="destructive">{data.issues.length} Issues</Badge>
                        )}
                        {data.warnings.length > 0 && (
                          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20">
                            {data.warnings.length} Warnings
                          </Badge>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2 pl-8">
                      {data.passed && data.warnings.length === 0 && (
                        <p className="text-sm text-muted-foreground">All checks passed successfully.</p>
                      )}
                      
                      {data.issues.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-destructive mb-2 flex items-center gap-2">
                            <XCircle className="w-4 h-4" /> Issues to Fix
                          </h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                            {data.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                          </ul>
                        </div>
                      )}

                      {data.warnings.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-600 mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Recommendations
                          </h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                            {data.warnings.map((warning, i) => <li key={i}>{warning}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOVerificationReport;
