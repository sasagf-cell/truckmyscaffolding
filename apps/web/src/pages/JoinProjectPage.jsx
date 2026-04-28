import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

const API_BASE = '/hcgi/api';

const JoinProjectPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [status, setStatus] = useState('validating'); // validating | valid | invalid | expired | joined
  const [inviteData, setInviteData] = useState(null);
  const [form, setForm] = useState({ full_name: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }
    const validateToken = async () => {
      try {
        const res = await fetch(`${API_BASE}/site-team/validate-token/${token}`);
        const data = await res.json();
        if (!res.ok || !data.valid) {
          setStatus('invalid');
          return;
        }
        setInviteData(data);
        setStatus('valid');
      } catch {
        setStatus('invalid');
      }
    };
    validateToken();
  }, [token]);

  const handleJoin = async () => {
    if (!form.full_name.trim() || !form.password) {
      toast.error('All fields are required');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/site-team/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          full_name: form.full_name.trim(),
          password: form.password
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to join project');
      }
      // Auto-login with the email from invite + supplied password
      try {
        await login(inviteData.email, form.password);
      } catch {
        // Login might fail if email differs — just redirect
      }
      setStatus('joined');
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      toast.error(err.message || 'Failed to join project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'validating') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'invalid' || status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full">
          <CardContent className="pt-6 text-center space-y-3">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="text-lg font-semibold">
              {status === 'expired' ? 'Link Expired' : 'Invalid Link'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {status === 'expired'
                ? 'This invite link has expired. Ask your coordinator to send a new one.'
                : 'This invite link is invalid or has already been used.'}
            </p>
            <Button variant="outline" asChild><Link to="/">Go Home</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'joined') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-sm w-full">
          <CardContent className="pt-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <h2 className="text-lg font-semibold">
              You've joined {inviteData?.project?.name || 'the project'}!
            </h2>
            <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-sm w-full">
        <CardHeader>
          <CardTitle>Join {inviteData?.project?.name || 'Project'}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {inviteData?.coordinator?.full_name || 'A coordinator'} has invited you to join as <strong>{inviteData?.role}</strong>.
            Create your account to get started.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={inviteData?.email || ''}
              disabled
              className="bg-gray-50 text-gray-600"
            />
            <p className="text-xs text-muted-foreground mt-1">This email was used for the invitation.</p>
          </div>
          <div>
            <Label>Full Name</Label>
            <Input
              placeholder="Your full name"
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
          </div>
          <Button className="w-full" onClick={handleJoin} disabled={submitting}>
            {submitting
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Joining...</>
              : 'Create Account & Join'}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Already have an account?{' '}
            <Link to={`/login?redirect=/join?token=${token}`} className="underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinProjectPage;
