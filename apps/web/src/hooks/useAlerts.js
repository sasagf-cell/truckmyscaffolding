
import { useState, useCallback, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useToast } from '@/hooks/use-toast';

export const useAlerts = (projectId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchAlerts = useCallback(async (type, page = 1, perPage = 5) => {
    if (!projectId) return null;
    setLoading(true);
    setError(null);
    try {
      const filter = `project_id="${projectId}"${type !== 'all' ? ` && type="${type}"` : ''}`;
      const result = await pb.collection('alerts').getList(page, perPage, {
        filter,
        sort: '-created',
        $autoCancel: false
      });
      return result;
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchAlertCount = useCallback(async () => {
    if (!projectId) return {};
    try {
      // Fetch all unread alerts to calculate counts
      const result = await pb.collection('alerts').getFullList({
        filter: `project_id="${projectId}" && is_read=false`,
        $autoCancel: false
      });
      
      const counts = {
        inactive_scaffolds: 0,
        missing_diary: 0,
        overdue_requests: 0,
        low_stock: 0,
        safety_incidents: 0,
        team_alerts: 0,
        all: result.length
      };

      result.forEach(alert => {
        if (counts[alert.type] !== undefined) {
          counts[alert.type]++;
        }
      });

      return counts;
    } catch (err) {
      console.error('Error fetching alert counts:', err);
      return {};
    }
  }, [projectId]);

  const markAsRead = useCallback(async (id, isRead) => {
    try {
      await pb.collection('alerts').update(id, { is_read: isRead }, { $autoCancel: false });
      return true;
    } catch (err) {
      console.error('Error updating alert:', err);
      toast({
        title: 'Error',
        description: 'Failed to update alert status.',
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  const deleteAlert = useCallback(async (id) => {
    try {
      await pb.collection('alerts').delete(id, { $autoCancel: false });
      toast({
        title: 'Success',
        description: 'Alert deleted successfully.'
      });
      return true;
    } catch (err) {
      console.error('Error deleting alert:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete alert.',
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  const generateAlerts = useCallback(async () => {
    // This would typically call a backend endpoint to trigger alert generation
    // For now, we just return true as a placeholder for the action
    return true;
  }, []);

  return {
    loading,
    error,
    fetchAlerts,
    fetchAlertCount,
    markAsRead,
    deleteAlert,
    generateAlerts
  };
};
