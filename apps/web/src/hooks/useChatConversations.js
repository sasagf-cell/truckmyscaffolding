
import { useState, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';
import { useToast } from '@/hooks/use-toast';

export const useChatConversations = (projectId, userId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchConversationHistory = useCallback(async () => {
    if (!projectId || !userId) return null;
    setLoading(true);
    setError(null);
    try {
      const result = await pb.collection('chat_conversations').getList(1, 1, {
        filter: `project_id="${projectId}" && user_id="${userId}"`,
        $autoCancel: false
      });
      
      if (result.items.length > 0) {
        return result.items[0];
      }
      return null;
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [projectId, userId]);

  const createConversation = useCallback(async (initialMessages = []) => {
    if (!projectId || !userId) return null;
    try {
      const record = await pb.collection('chat_conversations').create({
        project_id: projectId,
        user_id: userId,
        messages: initialMessages
      }, { $autoCancel: false });
      return record;
    } catch (err) {
      console.error('Error creating conversation:', err);
      toast({
        title: 'Error',
        description: 'Failed to start conversation.',
        variant: 'destructive'
      });
      return null;
    }
  }, [projectId, userId, toast]);

  const saveMessage = useCallback(async (conversationId, messages) => {
    try {
      const record = await pb.collection('chat_conversations').update(conversationId, {
        messages: messages
      }, { $autoCancel: false });
      return record;
    } catch (err) {
      console.error('Error saving message:', err);
      return null;
    }
  }, []);

  return {
    loading,
    error,
    fetchConversationHistory,
    createConversation,
    saveMessage
  };
};
