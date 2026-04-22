
import { useState, useCallback } from 'react';
import apiServerClient from '@/lib/apiServerClient';
import { useToast } from '@/hooks/use-toast';

export const useStripe = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const createCheckoutSession = useCallback(async (planId, billingCycle, projectId = null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiServerClient.fetch('/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle, projectId })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create checkout session');
      }
      
      const data = await res.json();
      return data;
    } catch (err) {
      setError(err.message);
      toast({ title: 'Checkout Error', description: err.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const verifySession = useCallback(async (sessionId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiServerClient.fetch(`/stripe/verify-session?sessionId=${sessionId}`);
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to verify payment');
      }
      
      return await res.json();
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentPlan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiServerClient.fetch('/stripe/current-plan');
      if (!res.ok) throw new Error('Failed to fetch plan');
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiServerClient.fetch('/stripe/invoices');
      if (!res.ok) throw new Error('Failed to fetch invoices');
      return await res.json(); // Returns array directly
    } catch (err) {
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const openCustomerPortal = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiServerClient.fetch('/stripe/customer-portal');
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to open portal');
      }
      const data = await res.json();
      window.open(data.portalUrl, '_blank');
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    error,
    createCheckoutSession,
    verifySession,
    getCurrentPlan,
    getInvoices,
    openCustomerPortal
  };
};
