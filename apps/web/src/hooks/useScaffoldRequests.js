
import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { useToast } from '@/hooks/use-toast';

export const useScaffoldRequests = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchRequests = useCallback(async (page = 1, perPage = 10, filterStr = '') => {
    setLoading(true);
    try {
      return await pb.collection('scaffold_requests').getList(page, perPage, {
        filter: filterStr,
        sort: '-created',
        expand: 'createdBy',
        $autoCancel: false
      });
    } catch (err) {
      console.error('Error fetching requests:', err);
      return { items: [], totalPages: 1, totalItems: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRequestById = useCallback(async (id) => {
    setLoading(true);
    try {
      return await pb.collection('scaffold_requests').getOne(id, { 
        expand: 'createdBy', 
        $autoCancel: false 
      });
    } catch (err) {
      console.error('Error fetching request:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createRequest = useCallback(async (data) => {
    setLoading(true);
    try {
      const record = await pb.collection('scaffold_requests').create(data, { $autoCancel: false });
      toast({ 
        title: 'Success', 
        description: data.status === 'draft' ? 'Request saved as draft.' : 'Request submitted successfully.' 
      });
      return record;
    } catch (err) {
      console.error('Error creating request:', err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateRequest = useCallback(async (id, data) => {
    setLoading(true);
    try {
      const record = await pb.collection('scaffold_requests').update(id, data, { $autoCancel: false });
      toast({ 
        title: 'Success', 
        description: data.status === 'draft' ? 'Draft updated successfully.' : 'Request submitted successfully.' 
      });
      return record;
    } catch (err) {
      console.error('Error updating request:', err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateRequestStatus = useCallback(async (id, status, extraData = {}) => {
    setLoading(true);
    try {
      let res;
      
      // Use the email-integrated backend endpoints for status changes
      if (status === 'approved') {
        res = await apiServerClient.fetch(`/email/approve-request/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: extraData.approverComments })
        });
      } else if (status === 'rejected') {
        res = await apiServerClient.fetch(`/email/reject-request/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: extraData.rejectionReason })
        });
      } else if (status === 'on_hold') {
        res = await apiServerClient.fetch(`/email/request-changes/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            changes_required: extraData.approverComments, 
            message: extraData.approverComments 
          })
        });
      } else {
        // Fallback for other statuses (e.g., completed)
        await pb.collection('scaffold_requests').update(id, { status, ...extraData }, { $autoCancel: false });
        toast({ title: 'Success', description: 'Status updated successfully.' });
        setLoading(false);
        return true;
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update status');
      }

      toast({ title: 'Success', description: 'Status updated and notifications sent.' });
      return true;
    } catch (err) {
      console.error('Error updating status:', err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { 
    loading, 
    fetchRequests, 
    fetchRequestById, 
    createRequest, 
    updateRequest,
    updateRequestStatus 
  };
};
