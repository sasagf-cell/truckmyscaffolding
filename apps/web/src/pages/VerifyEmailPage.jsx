import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import apiServerClient from '@/lib/apiServerClient';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying | success | error

  useEffect(() => {
    if (!token) { setStatus('error'); return; }

    const verify = async () => {
      try {
        const res = await apiServerClient.fetch(`/auth/verify-email?token=${token}`);
        if (res.ok) {
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-sm w-full">
        <CardContent className="pt-6 text-center space-y-3">
          {status === 'success' ? (
            <>
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              <h2 className="text-lg font-semibold">Email verified!</h2>
              <p className="text-sm text-muted-foreground">
                Your account is now active. You can log in.
              </p>
              <Button asChild className="w-full">
                <Link to="/login">Log in</Link>
              </Button>
            </>
          ) : (
            <>
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
              <h2 className="text-lg font-semibold">Verification failed</h2>
              <p className="text-sm text-muted-foreground">
                This link is invalid or has already been used.
              </p>
              <Button variant="outline" asChild><Link to="/signup">Sign up again</Link></Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;
