
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useStripe } from '@/hooks/useStripe.js';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const StripeSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const { verifySession } = useStripe();
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [planData, setPlanData] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!sessionId) {
      navigate('/dashboard');
      return;
    }

    const verify = async () => {
      const data = await verifySession(sessionId);
      if (data?.success) {
        setStatus('success');
        setPlanData(data);
      } else {
        setStatus('error');
      }
    };

    verify();
  }, [sessionId, verifySession, navigate]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/dashboard/settings/billing');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, navigate]);

  if (status === 'verifying') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-lg font-medium text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/20 shadow-lg">
          <CardContent className="pt-10 pb-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl text-destructive font-bold">!</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
            <p className="text-muted-foreground mb-8">
              We couldn't verify your payment session. Please contact support if you believe this is an error.
            </p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-500">
      <Card className="max-w-md w-full border-success/20 shadow-xl bg-gradient-to-b from-success/5 to-background">
        <CardContent className="pt-12 pb-8 text-center">
          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-3xl font-bold mb-3 tracking-tight">Payment Successful!</h2>
          <p className="text-lg text-muted-foreground mb-2">
            Welcome to the <span className="font-semibold text-foreground">{planData?.planName}</span> plan.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Your subscription is now active and ready to use.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate('/dashboard/settings/billing')} className="w-full group">
              Go to Billing Settings
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Redirecting automatically in {countdown} seconds...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StripeSuccessPage;
