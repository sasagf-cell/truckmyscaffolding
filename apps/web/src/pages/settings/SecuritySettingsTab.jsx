
import React, { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, ShieldCheck, Smartphone, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import apiServerClient from '@/lib/apiServerClient.js';
import { useToast } from '@/hooks/use-toast';

const SecuritySettingsTab = () => {
  const { changePassword, getLoginHistory } = useSettings();
  const { toast } = useToast();
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [loginHistory, setLoginHistory] = useState([]);
  const [twoFactorData, setTwoFactorData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      const history = await getLoginHistory();
      setLoginHistory(history || []);
    };
    fetchHistory();
  }, [getLoginHistory]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast({ title: 'Error', description: 'New passwords do not match.', variant: 'destructive' });
      return;
    }
    const success = await changePassword(passwords.current, passwords.new);
    if (success) {
      setIsPasswordModalOpen(false);
      setPasswords({ current: '', new: '', confirm: '' });
    }
  };

  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      const res = await apiServerClient.fetch('/users/enable-2fa', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setTwoFactorData(data);
        setIs2FAModalOpen(true);
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to initiate 2FA setup.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm2FA = async () => {
    setLoading(true);
    try {
      const res = await apiServerClient.fetch('/users/confirm-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationCode })
      });
      if (res.ok) {
        toast({ title: 'Success', description: 'Two-factor authentication enabled.' });
        setIs2FAModalOpen(false);
        setTwoFactorData(null);
      } else {
        throw new Error('Invalid code');
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Invalid verification code.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card>
        <CardHeader>
          <CardTitle>Password & Authentication</CardTitle>
          <CardDescription>Manage your password and security preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Password</h4>
              <p className="text-sm text-muted-foreground">Change your password to keep your account secure.</p>
            </div>
            <Button variant="outline" onClick={() => setIsPasswordModalOpen(true)}>Change Password</Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border rounded-lg">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium">Two-Factor Authentication (2FA)</h4>
                <Badge variant="secondary" className="bg-muted text-muted-foreground">Disabled</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Add an extra layer of security to your account.</p>
            </div>
            <Button onClick={handleEnable2FA} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enable 2FA
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Devices currently logged into your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-primary/10 rounded-full text-primary">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium flex items-center gap-2">
                    MacBook Pro - Chrome
                    <Badge className="bg-success/20 text-success hover:bg-success/30 border-0">Current Session</Badge>
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Berlin, Germany</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Active now</span>
                  </div>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
              Sign Out All Other Sessions
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>Recent login activity on your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Date & Time</th>
                  <th className="px-4 py-3 font-medium">Device</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loginHistory.length > 0 ? (
                  loginHistory.slice(0, 5).map((login, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">{format(new Date(login.timestamp || login.created), 'MMM dd, yyyy HH:mm')}</td>
                      <td className="px-4 py-3">{login.device || login.userAgent || 'Unknown Device'}</td>
                      <td className="px-4 py-3">{login.location || login.ipAddress || 'Unknown Location'}</td>
                      <td className="px-4 py-3">
                        {login.status === 'success' || !login.status ? (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">Success</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Failed</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No recent login history found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handlePasswordChange}>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>Enter your current password and a new password.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="current">Current Password</Label>
                <Input 
                  id="current" 
                  type="password" 
                  value={passwords.current} 
                  onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">New Password</Label>
                <Input 
                  id="new" 
                  type="password" 
                  value={passwords.new} 
                  onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <Input 
                  id="confirm" 
                  type="password" 
                  value={passwords.confirm} 
                  onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))} 
                  required 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
              <Button type="submit">Update Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2FA Setup Modal */}
      <Dialog open={is2FAModalOpen} onOpenChange={setIs2FAModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>Scan the QR code with your authenticator app.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-4">
            {twoFactorData?.qrCode && (
              <div className="p-2 bg-white rounded-xl border shadow-sm">
                <img src={twoFactorData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>
            )}
            <div className="w-full space-y-2">
              <Label htmlFor="code" className="text-center block">Enter Verification Code</Label>
              <Input 
                id="code" 
                placeholder="000000" 
                className="text-center text-lg tracking-widest"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIs2FAModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirm2FA} disabled={loading || verificationCode.length !== 6}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Verify & Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecuritySettingsTab;
