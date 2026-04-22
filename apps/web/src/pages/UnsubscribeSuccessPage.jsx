
import React from 'react';
import { Link } from 'react-router-dom';
import { MailX } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UnsubscribeSuccessPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-muted mx-auto rounded-2xl flex items-center justify-center mb-6">
          <MailX className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Unsubscribed successfully
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          You have been removed from this mailing list. You can always update your notification preferences in your account settings.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild variant="default">
            <Link to="/dashboard/settings/email-preferences">
              Manage Preferences
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnsubscribeSuccessPage;
