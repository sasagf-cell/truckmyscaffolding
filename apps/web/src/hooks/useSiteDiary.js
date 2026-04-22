
import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useToast } from '@/hooks/use-toast';

export const useSiteDiary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchEntries = useCallback(async (page = 1, perPage = 50, filter = '', sort = '-date') => {
    setLoading(true);
    setError(null);
    try {
      const result = await pb.collection('diary_entries').getList(page, perPage, {
        filter,
        sort,
        $autoCancel: false
      });
      return result;
    } catch (err) {
      console.error('Error fetching diary entries:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to fetch site diary entries.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchEntryById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const record = await pb.collection('diary_entries').getOne(id, {
        $autoCancel: false
      });
      return record;
    } catch (err) {
      console.error('Error fetching diary entry:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to fetch entry details.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createEntry = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const record = await pb.collection('diary_entries').create(data, { $autoCancel: false });
      toast({
        title: 'Success',
        description: 'Diary entry created successfully.'
      });
      return record;
    } catch (err) {
      console.error('Error creating diary entry:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to create diary entry.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateEntry = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const record = await pb.collection('diary_entries').update(id, data, { $autoCancel: false });
      toast({
        title: 'Success',
        description: 'Diary entry updated successfully.'
      });
      return record;
    } catch (err) {
      console.error('Error updating diary entry:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to update diary entry.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteEntry = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await pb.collection('diary_entries').delete(id, { $autoCancel: false });
      toast({
        title: 'Success',
        description: 'Diary entry deleted successfully.'
      });
      return true;
    } catch (err) {
      console.error('Error deleting diary entry:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to delete diary entry.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const checkEntryExists = useCallback(async (projectId, dateStr) => {
    try {
      const nextDay = new Date(dateStr);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];

      const result = await pb.collection('diary_entries').getList(1, 1, {
        filter: `project_id = "${projectId}" && date >= "${dateStr}" && date < "${nextDayStr}"`,
        $autoCancel: false
      });
      return result.items.length > 0 ? result.items[0] : null;
    } catch (err) {
      console.error('Error checking entry existence:', err);
      return null;
    }
  }, []);

  return {
    loading,
    error,
    fetchEntries,
    fetchEntryById,
    createEntry,
    updateEntry,
    deleteEntry,
    checkEntryExists
  };
};
