
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { format } from 'date-fns';
import { FileText, Loader2, Sparkles } from 'lucide-react';
import { useReports } from '@/hooks/useReports.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import DailyReportPreview from '@/components/DailyReportPreview.jsx';
import MonthlyReportPreview from '@/components/MonthlyReportPreview.jsx';
import ReportPreviewHeader from '@/components/ReportPreviewHeader.jsx';

const ReportGenerator = () => {
  const { selectedProject } = useOutletContext();
  const { fetchDailyReport, fetchMonthlyReport, loading } = useReports();
  
  const [reportType, setReportType] = useState('daily');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [reportData, setReportData] = useState(null);
  const [generatedParams, setGeneratedParams] = useState(null);
  const [aiSummary, setAiSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  const generateAISummary = async (dataToSummarize) => {
    setSummaryLoading(true);
    try {
      const payload = {
        message: `Generate a professional executive summary for this scaffold site report. 
        Data: ${JSON.stringify(dataToSummarize)}. 
        Write 2-3 sentences in professional construction management language. 
        Mention key metrics, any risks, and overall project health.`,
        projectId: selectedProject?.id
      };
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setAiSummary(data.response || data.message || '');
    } catch (err) {
      console.error('AI summary error:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedProject) return;
    
    setAiSummary(''); // Clear previous summary
    
    let data = null;
    if (reportType === 'daily') {
      data = await fetchDailyReport(selectedProject.id, date);
      if (data) {
        setReportData(data);
        setGeneratedParams({ type: 'daily', date });
      }
    } else {
      data = await fetchMonthlyReport(selectedProject.id, month);
      if (data) {
        setReportData(data);
        setGeneratedParams({ type: 'monthly', date: month });
      }
    }
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a project to generate reports.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Generate daily and monthly summaries for {selectedProject.name}</p>
      </div>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Report Configuration
          </CardTitle>
          <CardDescription>Select the type of report and date range to generate.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
            <div className="space-y-3">
              <Label>Report Type</Label>
              <RadioGroup 
                value={reportType} 
                onValueChange={(val) => { setReportType(val); setReportData(null); }}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily" className="cursor-pointer">Daily Report</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="cursor-pointer">Monthly Report</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3 flex-1 max-w-xs">
              <Label htmlFor="date-picker">
                {reportType === 'daily' ? 'Select Date' : 'Select Month'}
              </Label>
              {reportType === 'daily' ? (
                <Input 
                  id="date-picker"
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                />
              ) : (
                <Input 
                  id="date-picker"
                  type="month" 
                  value={month} 
                  onChange={(e) => setMonth(e.target.value)} 
                />
              )}
            </div>

            <Button onClick={handleGenerate} disabled={loading} className="w-full md:w-auto">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {reportData && generatedParams && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ReportPreviewHeader 
            project={selectedProject} 
            reportType={generatedParams.type} 
            date={generatedParams.date} 
          />
          
          {/* AI Executive Summary */}
          <div className="border border-primary/20 bg-primary/5 rounded-xl p-5 space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">AI Executive Summary</h3>
              </div>
              <button
                onClick={() => generateAISummary(reportData)}
                disabled={summaryLoading}
                className="text-xs px-3 py-1.5 bg-primary text-black rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {summaryLoading ? 'Generating...' : 'Generate Summary'}
              </button>
            </div>
            {aiSummary && (
              <p className="text-sm text-muted-foreground leading-relaxed">{aiSummary}</p>
            )}
            {!aiSummary && !summaryLoading && (
              <p className="text-xs text-muted-foreground italic">
                Click "Generate Summary" to get an AI-written executive summary for this report.
              </p>
            )}
          </div>
          
          <div className="overflow-x-auto pb-8">
            {generatedParams.type === 'daily' ? (
              <DailyReportPreview 
                reportData={reportData} 
                project={selectedProject} 
                date={generatedParams.date} 
              />
            ) : (
              <MonthlyReportPreview 
                reportData={reportData} 
                project={selectedProject} 
                month={generatedParams.date} 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
