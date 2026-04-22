
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useSettings } from '@/hooks/useSettings.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const NOTIFICATION_ITEMS = [
  { id: 'scaffoldRequestSubmitted', label: 'Scaffold Request Submitted', description: 'Receive an email when a new scaffold request is created.' },
  { id: 'scaffoldRequestApproved', label: 'Scaffold Request Approved', description: 'Receive an email when a request is approved.' },
  { id: 'scaffoldRequestRejected', label: 'Scaffold Request Rejected', description: 'Receive an email when a request is rejected or needs changes.' },
  { id: 'siteDiaryReminder', label: 'Site Diary Reminder', description: 'Daily reminder if the site diary has not been filled out.' },
  { id: 'materialDeliveryNotification', label: 'Material Delivery', description: 'Alerts for upcoming or completed material deliveries.' },
  { id: 'teamMemberInvited', label: 'Team Member Invited', description: 'Notification when a new subcontractor joins the project.' },
  { id: 'alertGenerated', label: 'System Alerts', description: 'Immediate notification for critical system alerts (e.g., safety incidents).' },
  { id: 'weeklySummaryReport', label: 'Weekly Summary Report', description: 'Receive a weekly digest of project activities.' },
  { id: 'monthlySummaryReport', label: 'Monthly Summary Report', description: 'Receive a comprehensive monthly project report.' },
];

const NotificationsSettingsTab = () => {
  const { currentUser } = useAuth();
  const { getNotificationPreferences, updateNotificationPreferences, loading } = useSettings();
  
  const [preferences, setPreferences] = useState({});

  useEffect(() => {
    const loadPreferences = async () => {
      if (currentUser?.id) {
        const data = await getNotificationPreferences(currentUser.id);
        if (data) {
          setPreferences(data);
        } else {
          // Default all to true if no record exists
          const defaults = {};
          NOTIFICATION_ITEMS.forEach(item => defaults[item.id] = true);
          setPreferences(defaults);
        }
      }
    };
    loadPreferences();
  }, [currentUser, getNotificationPreferences]);

  const handleToggle = (id, checked) => {
    setPreferences(prev => ({ ...prev, [id]: checked }));
  };

  const handleSave = async () => {
    await updateNotificationPreferences(preferences);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Choose what events you want to be notified about via email.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {NOTIFICATION_ITEMS.map((item) => (
              <div key={item.id} className="flex items-center justify-between space-x-4">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor={item.id} className="text-base font-medium leading-none cursor-pointer">
                    {item.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Switch 
                  id={item.id} 
                  checked={!!preferences[item.id]} 
                  onCheckedChange={(checked) => handleToggle(item.id, checked)}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-6 mt-6 border-t">
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsSettingsTab;
