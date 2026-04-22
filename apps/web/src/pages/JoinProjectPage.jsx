import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const JoinProjectPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [status, setStatus] = useState('validating'); // validating | valid | invalid | expired | joined
  const [projectName, setProjectName] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const res = await fetch(`${API_URL}/api/join/${token}`);
        const data = await res.json();
        if (!res.ok || data.error) {
          setStatus(data.expired ? 'expired' : 'invalid');
          return;
        }
        setProjectName(data.project_name);
        // If already logged in, join directly
        if (currentUser) {
          await joinExistingUser();
        } else {
          setStatus('valid');
        }
      } catch {
        setStatus('invalid');
      }
    };
    validateToken();
  }, [token]);

  const joinExistingUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/join/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('pb_auth_token')}` }
      });
      if (!res.ok) throw new Error();
      setStatus('joined');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch {
      toast.error('Failed to join project');
    }
  };

  const handleSignupAndJoin = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error('All fields are required');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSubmitting(true);
    try {
      // Create account
      await pb.collection('users').create({
        name: form.name,
        email: form.email,
        password: form.password,
        passwordConfirm: form.password,
        role: 'Subcontractor'
      });
      // Login
      await pb.collection('users').authWithPassword(form.email, form.password);
      // Accept invite
      const res = await fetch(`${API_URL}/api/join/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pb.authStore.token}` }
      });
      if (!res.ok) throw new Error();
      setStatus('joined');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      toast.error(err.message?.includes('email') ? 'Email already in use' : 'Failed to create account');
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
            <h2 className="text-lg font-semibold">{status === 'expired' ? 'Link Expired' : 'Invalid Link'}</h2>
            <p className="text-sm text-muted-foreground">
              {status === 'expired'
                ? 'This QR code has expired. Ask your coordinator to generate a new one.'
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
            <h2 className="text-lg font-semibold">You've joined {projectName}!</h2>
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
          <CardTitle>Join {projectName}</CardTitle>
          <p className="text-sm text-muted-foreground">Create your account to access this project on TrackMyScaffolding.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <Button className="w-full" onClick={handleSignupAndJoin} disabled={submitting}>
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Joining...</> : 'Create Account & Join'}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Already have an account? <Link to={`/login?redirect=/join/${token}`} className="underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinProjectPage;
