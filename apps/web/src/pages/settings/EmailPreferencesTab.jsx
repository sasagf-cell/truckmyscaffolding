
import React, { useState, useEffect } from 'react';
import { Save, Mail, AlertTriangle, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const EMAIL_TYPES = [
  { id: 'welcome', label: 'Welcome & Onboarding', description: 'Account setup instructions and getting started guides.' },
  { id: 'day3-followup', label: 'Follow-up Reminders', description: 'Helpful tips if you haven\'t set up your first project.' },
  { id: 'subuser-welcome', label: 'Team Invitations', description: 'When you are added to a new project or team.' },
  { id: 'request-submitted', label: 'Request Submitted', description: 'Confirmation when a new scaffold request is created.' },
  { id: 'request-approved', label: 'Request Approved', description: 'When a scaffold request is approved by a coordinator.' },
  { id: 'request-rejected', label: 'Request Rejected', description: 'When a scaffold request is denied.' },
  { id: 'changes-requested', label: 'Changes Requested', description: 'When a request needs modifications before approval.' },
  { id: 'pending-reminder', label: 'Pending Approvals', description: 'Reminders for requests waiting for your approval.' },
  { id: 'monthly-report', label: 'Monthly Reports', description: 'Automated monthly summaries of scaffold activity.' },
  { id: 'plan-limit-reached', label: 'Usage Limits', description: 'Alerts when you approach or reach your plan limits.' },
  { id: 'payment-confirmation', label: 'Billing & Payments', description: 'Invoices and payment confirmation receipts.' }
];

const EmailPreferencesTab = () => {
  const [preferences, setPreferences] = useState({});
  const [language, setLanguage] = useState('EN');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const user = pb.authStore.model;
      if (!user) return;

      // Initialize default preferences (all true)
      const defaultPrefs = EMAIL_TYPES.reduce((acc, type) => ({ ...acc, [type.id]: true }), {});
      
      // Merge with user's saved preferences (which stores what they opted OUT of, or explicit states)
      const savedPrefs = user.emailPreferences || {};
      
      setPreferences({ ...defaultPrefs, ...savedPrefs });
      setLanguage(user.language || 'EN');
    } catch (error) {
      console.error('Failed to load email preferences:', error);
      toast.error('Could not load your email preferences.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (id, checked) => {
    setPreferences(prev => ({ ...prev, [id]: checked }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const user = pb.authStore.model;
      await pb.collection('users').update(user.id, {
        emailPreferences: preferences,
        language: language
      }, { $autoCancel: false });
      
      toast.success('Email preferences saved successfully.');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    setIsSaving(true);
    try {
      const user = pb.authStore.model;
      const allDisabled = EMAIL_TYPES.reduce((acc, type) => {
        // Keep billing and critical account emails enabled even on "unsubscribe all"
        const isCritical = ['payment-confirmation', 'plan-limit-reached'].includes(type.id);
        return { ...acc, [type.id]: isCritical };
      }, {});

      await pb.collection('users').update(user.id, {
        emailPreferences: allDisabled
      }, { $autoCancel: false });
      
      setPreferences(allDisabled);
      toast.success('Unsubscribed from all non-critical emails.');
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      toast.error('Failed to update preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading preferences...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-2xl font-medium tracking-tight">Email Preferences</h3>
        <p className="text-muted-foreground mt-1">
          Manage which notifications you receive and your preferred language.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            General Settings
          </CardTitle>
          <CardDescription>Set your primary communication language.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2 max-w-xs">
            <Label htmlFor="language">Email Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EN">English</SelectItem>
                <SelectItem value="DE">Deutsch (German)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Types</CardTitle>
          <CardDescription>Choose which updates you want to receive in your inbox.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {EMAIL_TYPES.map((type, index) => (
            <React.Fragment key={type.id}>
              {index > 0 && <Separator />}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor={`toggle-${type.id}`} className="text-base font-medium cursor-pointer">
                    {type.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                </div>
                <Switch
                  id={`toggle-${type.id}`}
                  checked={preferences[type.id] !== false}
                  onCheckedChange={(checked) => handleToggle(type.id, checked)}
                  disabled={type.id === 'payment-confirmation'} // Prevent disabling billing emails
                />
              </div>
            </React.Fragment>
          ))}
        </CardContent>
        <CardFooter className="bg-muted/50 flex justify-between items-center border-t p-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2">
                <BellOff className="w-4 h-4" />
                Unsubscribe from all
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will disable all email notifications except for critical account and billing updates. You might miss important scaffold request approvals.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleUnsubscribeAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Yes, unsubscribe
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmailPreferencesTab;
