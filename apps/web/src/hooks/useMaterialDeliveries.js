
import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { useToast } from '@/hooks/use-toast';

export const useMaterialDeliveries = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchDeliveries = useCallback(async (page = 1, perPage = 10, filter = '', sort = '-delivery_date') => {
    setLoading(true);
    setError(null);
    try {
      const result = await pb.collection('material_deliveries').getList(page, perPage, {
        filter,
        sort,
        $autoCancel: false
      });
      return result;
    } catch (err) {
      console.error('Error fetching deliveries:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to fetch material deliveries.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchDeliveryById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const record = await pb.collection('material_deliveries').getOne(id, {
        $autoCancel: false
      });
      return record;
    } catch (err) {
      console.error('Error fetching delivery:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to fetch delivery details.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchMaterialItems = useCallback(async (deliveryId) => {
    try {
      const items = await pb.collection('material_items').getFullList({
        filter: `delivery_id="${deliveryId}"`,
        $autoCancel: false
      });
      return items;
    } catch (err) {
      console.error('Error fetching material items:', err);
      return [];
    }
  }, []);

  const createDelivery = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const record = await pb.collection('material_deliveries').create(data, { $autoCancel: false });
      return record;
    } catch (err) {
      console.error('Error creating delivery:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to create material delivery.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createMaterialItems = useCallback(async (items) => {
    try {
      const promises = items.map(item => 
        pb.collection('material_items').create(item, { $autoCancel: false })
      );
      await Promise.all(promises);
      return true;
    } catch (err) {
      console.error('Error creating material items:', err);
      toast({
        title: 'Error',
        description: 'Failed to save some material items.',
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  const updateDelivery = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const record = await pb.collection('material_deliveries').update(id, data, { $autoCancel: false });
      toast({
        title: 'Success',
        description: 'Delivery updated successfully.'
      });
      return record;
    } catch (err) {
      console.error('Error updating delivery:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to update delivery.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteDelivery = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      // First fetch and delete all related items
      const items = await fetchMaterialItems(id);
      const deletePromises = items.map(item => 
        pb.collection('material_items').delete(item.id, { $autoCancel: false })
      );
      await Promise.all(deletePromises);

      // Then delete the delivery itself
      await pb.collection('material_deliveries').delete(id, { $autoCancel: false });
      
      toast({
        title: 'Success',
        description: 'Delivery and related items deleted successfully.'
      });
      return true;
    } catch (err) {
      console.error('Error deleting delivery:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to delete delivery.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchMaterialItems, toast]);

  const fetchInventorySummary = useCallback(async (projectId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiServerClient.fetch(`/inventory/summary?projectId=${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch inventory summary');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching inventory summary:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load inventory summary.',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    error,
    fetchDeliveries,
    fetchDeliveryById,
    fetchMaterialItems,
    createDelivery,
    createMaterialItems,
    updateDelivery,
    deleteDelivery,
    fetchInventorySummary
  };
};
