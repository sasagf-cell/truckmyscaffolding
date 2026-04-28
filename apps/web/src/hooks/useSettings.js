
import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { useToast } from '@/hooks/use-toast';

export const useSettings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const getUserProfile = useCallback(async (userId) => {
    setLoading(true);
    try {
      const record = await pb.collection('users').getOne(userId, { $autoCancel: false });
      return record;
    } catch (err) {
      console.error('Error fetching profile:', err);
      toast({ title: 'Error', description: 'Failed to load profile.', variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateUserProfile = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await apiServerClient.fetch('/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to update profile');
      const result = await res.json();
      toast({ title: 'Success', description: 'Profile updated successfully.' });
      return result.user;
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateUserAvatar = useCallback(async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await apiServerClient.fetch('/users/avatar', {
        method: 'PATCH',
        body: formData
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to update avatar');
      const result = await res.json();
      toast({ title: 'Success', description: 'Avatar updated successfully.' });
      return result.avatarUrl;
    } catch (err) {
      console.error('Error updating avatar:', err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getProjectSettings = useCallback(async (projectId) => {
    setLoading(true);
    try {
      const record = await pb.collection('projects').getOne(projectId, { $autoCancel: false });
      return record;
    } catch (err) {
      console.error('Error fetching project:', err);
      toast({ title: 'Error', description: 'Failed to load project settings.', variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateProjectDetails = useCallback(async (projectId, data) => {
    setLoading(true);
    try {
      const updated = await pb.collection('projects').update(projectId, {
        name: data.name,
        location: data.location,
        type: data.type,
        description: data.description,
        status: data.status,
      }, { $autoCancel: false });
      toast({ title: 'Success', description: 'Project details updated.' });
      return updated;
    } catch (err) {
      console.error('Error updating project details:', err);
      const pbDetail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      toast({ title: 'Error', description: pbDetail || 'Failed to update project', variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateProjectSettings = useCallback(async (projectId, data) => {
    setLoading(true);
    try {
      const updated = await pb.collection('projects').update(projectId, {
        contract_type: data.contract_type,
        inspection_interval_days: data.inspection_interval_days,
        primary_scaffold_system: data.scaffold_system || data.primary_scaffold_system || '',
        allow_mixed_systems: data.allow_mixed_systems ?? false,
        rate: data.rate != null && data.rate !== '' ? parseFloat(data.rate) || 0 : undefined,
        rate_currency: data.rate_currency || 'EUR',
        rate_unit: data.rate_unit || '',
      }, { $autoCancel: false });
      toast({ title: 'Success', description: 'Project settings updated.' });
      return updated;
    } catch (err) {
      console.error('Error updating project:', err);
      toast({ title: 'Error', description: err.message || 'Failed to update project', variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getNotificationPreferences = useCallback(async (userId) => {
    setLoading(true);
    try {
      const records = await pb.collection('notificationPreferences').getFullList({
        filter: pb.filter('userId = {:uid}', { uid: userId }),
        $autoCancel: false
      });
      return records.length > 0 ? records[0] : null;
    } catch (err) {
      console.error('Error fetching notifications:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNotificationPreferences = useCallback(async (preferences) => {
    setLoading(true);
    try {
      const res = await apiServerClient.fetch('/users/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationPreferences: preferences })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to update preferences');
      const result = await res.json();
      toast({ title: 'Success', description: 'Notification preferences saved.' });
      return result.preferences;
    } catch (err) {
      console.error('Error updating notifications:', err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      const res = await apiServerClient.fetch('/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to change password');
      toast({ title: 'Success', description: 'Password updated successfully.' });
      return true;
    } catch (err) {
      console.error('Error changing password:', err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getLoginHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiServerClient.fetch('/users/login-history');
      if (!res.ok) throw new Error('Failed to fetch login history');
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Error fetching login history:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getUserProfile,
    updateUserProfile,
    updateUserAvatar,
    getProjectSettings,
    updateProjectDetails,
    updateProjectSettings,
    getNotificationPreferences,
    updateNotificationPreferences,
    changePassword,
    getLoginHistory
  };
};
