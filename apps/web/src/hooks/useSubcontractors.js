
import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';

export const useSubcontractors = () => {
  const [loading, setLoading] = useState(false);

  const fetchSubcontractors = useCallback(async (projectId) => {
    setLoading(true);
    try {
      return await pb.collection('site_team_invites').getFullList({
        filter: projectId ? pb.filter('projectId = {:pid}', { pid: projectId }) : '',
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
      const res = await apiServerClient.fetch('/site-team/invite', {
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

      if (!result.emailSent && result.emailError) {
        toast.warning('Invite created but email failed to send. Share the link manually.');
        console.error('Email error from server:', result.emailError);
      } else {
        toast.success('Invitation sent successfully.');
      }

      const inviteUrl = result.inviteUrl || `${window.location.origin}/join?token=${result.inviteToken || result.subcontractorId}`;

      return { success: true, inviteUrl };
    } catch (err) {
      console.error('Error inviting subcontractor:', err);
      toast.error(err.message || 'Failed to send invite');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const listSubcontractors = useCallback(async (projectId, page = 1, pageSize = 20, filters = {}) => {
    setLoading(true);
    try {
      // pb.filter() safely escapes all values — prevents PocketBase filter injection
      const filterParts = [pb.filter('projectId = {:pid}', { pid: projectId })];
      if (filters.status && filters.status !== 'all') filterParts.push(pb.filter('status = {:s}', { s: filters.status }));
      if (filters.role && filters.role !== 'all') filterParts.push(pb.filter('role = {:r}', { r: filters.role }));
      if (filters.search) filterParts.push(pb.filter('userId.full_name ~ {:q}', { q: filters.search }));

      return await pb.collection('site_team_invites').getList(page, pageSize, {
        filter: filterParts.join(' && '),
        expand: 'userId',
        sort: '-created',
        $autoCancel: false
      });
    } catch (err) {
      console.error('Error listing subcontractors:', err);
      toast.error('Failed to load team members.');
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
