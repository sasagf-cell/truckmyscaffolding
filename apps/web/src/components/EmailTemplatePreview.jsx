
import React, { useState } from 'react';
import { Send, RefreshCw, Code, Eye, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import apiServerClient from '@/lib/apiServerClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TEMPLATES = [
  'welcome', 'day3-followup', 'subuser-welcome', 'request-submitted', 
  'request-approved', 'request-rejected', 'changes-requested', 
  'pending-reminder', 'monthly-report', 'plan-limit-reached', 'payment-confirmation'
];

const DEFAULT_VARIABLES = {
  firstName: 'Alex',
  lastName: 'Müller',
  email: 'alex@example.com',
  projectName: 'Berlin Industrial Park',
  requestId: 'REQ-8492',
  scaffoldNumber: 'SCA-104',
  plantSection: 'Boiler Room B',
  installationLevel: '+12.5m',
  startDate: '2026-05-01',
  endDate: '2026-06-15',
  subcontractorName: 'BuildTech GmbH',
  coordinatorName: 'Sarah Schmidt',
  coordinatorComment: 'Please ensure heavy-duty base plates are used.',
  approvedDate: '2026-04-04',
  approvedTime: '14:30',
  monthYear: 'April 2026',
  totalRequests: 45,
  approved: 38,
  rejected: 2,
  pending: 5,
  activeScaffolds: 112,
  totalHours: 840,
  pendingCount: 3,
  planName: 'Professional',
  amount: '€149.00',
  billingPeriod: 'Monthly',
  nextBillingDate: '2026-05-04'
};

const EmailTemplatePreview = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('welcome');
  const [language, setLanguage] = useState('en');
  const [testEmail, setTestEmail] = useState('');
  const [variables, setVariables] = useState(JSON.stringify(DEFAULT_VARIABLES, null, 2));
  const [previewHtml, setPreviewHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fetchPreview = async () => {
    setIsLoading(true);
    try {
      let parsedVars = {};
      try {
        parsedVars = JSON.parse(variables);
      } catch (e) {
        toast.error('Invalid JSON in variables');
        setIsLoading(false);
        return;
      }

      const response = await apiServerClient.fetch(`/email-test/${selectedTemplate}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          variables: parsedVars,
          previewOnly: true
        })
      });

      if (!response.ok) throw new Error('Failed to fetch preview');
      
      const data = await response.json();
      setPreviewHtml(data.html || '<div style="padding: 20px; text-align: center; color: #64748b;">Preview not available. Backend endpoint required.</div>');
    } catch (error) {
      console.error('Preview error:', error);
      // Fallback for UI demonstration since backend isn't implemented by this agent
      setPreviewHtml(`
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background: #f8fafc; padding: 24px; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <h2 style="margin: 0; color: #1E3A5F;">Track<span style="color: #0EA5A0;">MyScaffolding</span></h2>
          </div>
          <div style="padding: 32px; color: #1E3A5F;">
            <p><strong>Template:</strong> ${selectedTemplate} (${language.toUpperCase()})</p>
            <p><em>Note: This is a mock preview. The actual HTML rendering engine is handled by the backend email service.</em></p>
            <div style="margin-top: 24px;">
              <a href="#" style="display: inline-block; background: #0EA5A0; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">Sample CTA Button</a>
            </div>
          </div>
          <div style="background: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
            <p>TrackMyScaffolding · trackmyscaffolding.com</p>
            <p><a href="#" style="color: #64748b;">Privacy Policy</a> | <a href="#" style="color: #64748b;">Unsubscribe</a></p>
          </div>
        </div>
      `);
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setIsSending(true);
    try {
      let parsedVars = {};
      try {
        parsedVars = JSON.parse(variables);
      } catch (e) {
        toast.error('Invalid JSON in variables');
        setIsSending(false);
        return;
      }

      const response = await apiServerClient.fetch(`/email-test/${selectedTemplate}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          testEmail,
          variables: parsedVars
        })
      });

      if (!response.ok) throw new Error('Failed to send test email');
      toast.success(`Test email sent to ${testEmail}`);
    } catch (error) {
      console.error('Send error:', error);
      toast.error('Failed to send test email. Ensure backend service is running.');
    } finally {
      setIsSending(false);
    }
  };

  // Fetch preview when template or language changes
  React.useEffect(() => {
    fetchPreview();
  }, [selectedTemplate, language]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Template Settings</CardTitle>
            <CardDescription>Configure the email template to preview.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (EN)</SelectItem>
                  <SelectItem value="de">German (DE)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Test Variables (JSON)</Label>
              <Textarea 
                value={variables}
                onChange={(e) => setVariables(e.target.value)}
                className="font-mono text-xs h-64"
              />
              <Button variant="outline" size="sm" onClick={fetchPreview} className="w-full mt-2 gap-2">
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Update Preview
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Send Test Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Recipient Email</Label>
              <Input 
                type="email" 
                placeholder="admin@example.com" 
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <Button onClick={sendTestEmail} disabled={isSending} className="w-full gap-2">
              <Send className="w-4 h-4" />
              {isSending ? 'Sending...' : 'Send Test Email'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-8">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-muted-foreground" />
                Live Preview
              </CardTitle>
              <Tabs defaultValue="preview" className="w-[200px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 border-t bg-muted/20">
            {isLoading && !previewHtml ? (
              <div className="h-full min-h-[500px] flex items-center justify-center text-muted-foreground">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="h-full min-h-[600px] w-full bg-white">
                <iframe 
                  srcDoc={previewHtml} 
                  title="Email Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailTemplatePreview;
