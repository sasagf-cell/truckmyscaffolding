
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logPageView, logEvent } from '@/utils/analyticsSetup.js';

export const useAnalytics = () => {
  const location = useLocation();

  // Track page views on route change
  useEffect(() => {
    logPageView(location.pathname + location.search);
  }, [location]);

  return {
    trackEvent: (action, category, label, value) => {
      logEvent(action, category, label, value);
    }
  };
};
