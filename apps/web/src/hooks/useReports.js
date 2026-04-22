
import { useState, useCallback } from 'react';
import apiServerClient from '@/lib/apiServerClient';
import { useToast } from '@/hooks/use-toast';

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchDailyReport = useCallback(async (projectId, date) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiServerClient.fetch(`/reports/daily?projectId=${projectId}&date=${date}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch daily report');
      }
      return await res.json();
    } catch (err) {
      setError(err.message);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchMonthlyReport = useCallback(async (projectId, month) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiServerClient.fetch(`/reports/monthly?projectId=${projectId}&month=${month}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch monthly report');
      }
      return await res.json();
    } catch (err) {
      setError(err.message);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const sendReportEmail = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiServerClient.fetch('/reports/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to send email');
      }
      toast({ title: 'Success', description: 'Report sent successfully' });
      return await res.json();
    } catch (err) {
      setError(err.message);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { loading, error, fetchDailyReport, fetchMonthlyReport, sendReportEmail };
};
