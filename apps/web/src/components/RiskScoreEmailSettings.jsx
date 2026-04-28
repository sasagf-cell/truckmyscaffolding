import React, { useState, useEffect } from 'react';
import { Bell, Mail, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import pb from '@/lib/pocketbaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * RiskScoreEmailSettings
 *
 * Allows the user to opt-in to email alerts when the project Risk Score
 * drops below 30. Settings are persisted via POST /api/projects/:id/alert-settings.
 *
 * Props:
 *   projectId  {string}  – PocketBase project record ID (required)
 */
const RiskScoreEmailSettings = ({ projectId }) => {
  const { currentUser } = useAuth();

  const [enabled, setEnabled] = useState(false);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Initialise email from the authenticated user's record
  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  // Mark form dirty whenever the user changes a value
  const handleToggle = (value) => {
    setEnabled(value);
    setDirty(true);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setDirty(true);
  };

  const handleSave = async () => {
    if (!projectId) {
      toast.error('No project selected.');
      return;
    }

    // Basic email validation when alerts are enabled
    if (enabled && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/alert-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pb.authStore.token}`,
        },
        body: JSON.stringify({
          risk_score_alert_enabled: enabled,
          risk_score_alert_email: email,
          risk_score_threshold: 30,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Server error ${res.status}`);
      }

      setDirty(false);
      toast.success(
        enabled
          ? `Alert enabled — you'll be notified at ${email}`
          : 'Email alert disabled.'
      );
    } catch (err) {
      toast.error(err.message || 'Failed to save alert settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="glass-card border border-cyan-500/20 bg-cyan-500/5">
      {/* Decorative glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-xl overflow-hidden"
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl" />
      </div>

      <CardHeader className="pb-3 relative z-10">
        <CardTitle className="flex items-center gap-2 text-base text-white">
          <Bell className="w-4 h-4 text-cyan-400" />
          Risk Score Email Alert
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Receive an email when the project Risk Score drops below{' '}
          <span className="font-semibold text-cyan-400">30</span>.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 relative z-10">
        {/* Toggle row */}
        <div className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/30 px-4 py-3">
          <Label
            htmlFor="risk-alert-toggle"
            className="text-sm text-white cursor-pointer select-none"
          >
            Email me when Risk Score &lt; 30
          </Label>
          <Switch
            id="risk-alert-toggle"
            checked={enabled}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-cyan-500"
          />
        </div>

        {/* Email input — always visible so the user can update their address */}
        <div className="space-y-1.5">
          <Label
            htmlFor="risk-alert-email"
            className="text-xs text-muted-foreground flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            Alert email address
          </Label>
          <Input
            id="risk-alert-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={handleEmailChange}
            disabled={!enabled}
            className="bg-black/40 border-white/10 text-white placeholder:text-muted-foreground
                       focus-visible:ring-cyan-500/50 disabled:opacity-40"
          />
        </div>

        {/* Save button */}
        <Button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold
                     disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-black/40 border-t-black rounded-full animate-spin" />
              Saving…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-3.5 h-3.5" />
              Save Alert Settings
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RiskScoreEmailSettings;
