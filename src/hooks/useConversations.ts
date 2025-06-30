import { useState, useEffect } from 'react';
import { supabase, Conversation, Message } from '../lib/supabase';
import { ChatMessage } from '../services/geminiChat';
import { useAuth } from './useAuth';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  // Load conversations for the current user
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setConversations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (title: string = 'New Conversation'): Promise<Conversation | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title
        })
        .select()
        .single();

      if (error) throw error;

      setConversations(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      return null;
    }
  };

  const updateConversation = async (id: string, updates: Partial<Conversation>) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setConversations(prev => 
        prev.map(conv => conv.id === id ? data : conv)
      );

      if (currentConversation?.id === id) {
        setCurrentConversation(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update conversation');
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setConversations(prev => prev.filter(conv => conv.id !== id));
      
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete conversation');
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      const chatMessages: ChatMessage[] = (data || []).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: msg.timestamp,
        messageId: msg.message_id
      }));

      setMessages(chatMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const saveMessage = async (conversationId: string, message: ChatMessage) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: message.role,
          content: message.content,
          timestamp: message.timestamp,
          message_id: message.messageId
        });

      if (error) throw error;

      // Update conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save message');
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setCurrentConversation(conversation);
    await loadMessages(conversation.id);
  };

  const addMessageToCurrentConversation = async (message: ChatMessage) => {
    if (!currentConversation) return;

    // Add to local state immediately
    setMessages(prev => [...prev, message]);

    // Save to database
    await saveMessage(currentConversation.id, message);
  };

  const clearCurrentConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
  };

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    createConversation,
    updateConversation,
    deleteConversation,
    selectConversation,
    addMessageToCurrentConversation,
    clearCurrentConversation,
    setMessages
  };
};