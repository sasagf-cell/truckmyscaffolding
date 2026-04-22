
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

  const updateProjectSettings = useCallback(async (projectId, data) => {
    setLoading(true);
    try {
      const res = await apiServerClient.fetch(`/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to update project');
      const result = await res.json();
      toast({ title: 'Success', description: 'Project settings updated.' });
      return result.project;
    } catch (err) {
      console.error('Error updating project:', err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getNotificationPreferences = useCallback(async (userId) => {
    setLoading(true);
    try {
      const records = await pb.collection('notificationPreferences').getFullList({
        filter: `userId="${userId}"`,
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
    updateProjectSettings,
    getNotificationPreferences,
    updateNotificationPreferences,
    changePassword,
    getLoginHistory
  };
};
