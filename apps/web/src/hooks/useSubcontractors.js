
import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { useToast } from '@/hooks/use-toast';

export const useSubcontractors = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSubcontractors = useCallback(async (projectId) => {
    setLoading(true);
    try {
      return await pb.collection('subcontractors').getFullList({
        filter: projectId ? `projectId="${projectId}"` : '',
        expand: 'userId',
        $autoCancel: false
      });
    } catch (err) {
      console.error('Error fetching subcontractors:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const inviteSubcontractor = useCallback(async (data) => {
    setLoading(true);
    try {
      // Use the new email-integrated backend endpoint
      const res = await apiServerClient.fetch('/email/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: data.projectId,
          email: data.email,
          role: data.role,
          message: data.message,
          permissions: data.permissions
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send invite');
      }
      
      const result = await res.json();
      toast({ title: 'Success', description: 'Invitation sent successfully.' });
      
      // Construct invite URL if not provided directly by backend
      const inviteUrl = result.inviteUrl || `${window.location.origin}/join?token=${result.inviteToken || result.subcontractorId}`;
      
      return { success: true, inviteUrl };
    } catch (err) {
      console.error('Error inviting subcontractor:', err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const listSubcontractors = useCallback(async (projectId, page = 1, pageSize = 20, filters = {}) => {
    setLoading(true);
    try {
      const filterParts = [`projectId="${projectId}"`];
      if (filters.status) filterParts.push(`status="${filters.status}"`);
      if (filters.role) filterParts.push(`role="${filters.role}"`);
      if (filters.search) filterParts.push(`userId.full_name~"${filters.search}"`);

      return await pb.collection('subcontractors').getList(page, pageSize, {
        filter: filterParts.join(' && '),
        expand: 'userId',
        sort: '-created',
        $autoCancel: false
      });
    } catch (err) {
      console.error('Error listing subcontractors:', err);
      toast({ title: 'Error', description: 'Failed to load team members.', variant: 'destructive' });
      return { items: [], totalItems: 0, totalPages: 0 };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    fetchSubcontractors,
    listSubcontractors,
    inviteSubcontractor
  };
};
