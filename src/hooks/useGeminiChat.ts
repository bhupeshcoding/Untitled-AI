import { useState, useCallback, useRef } from 'react';
import { ChatInterface, ChatMessage, StreamCallbacks } from '../services/geminiChat';

export interface UseGeminiChatOptions {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  enableStreaming?: boolean;
  maxHistoryMessages?: number;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isStreaming: boolean;
  currentStreamingMessage: string;
}

export const useGeminiChat = (options: UseGeminiChatOptions) => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    isStreaming: false,
    currentStreamingMessage: ''
  });

  const chatRef = useRef<ChatInterface | null>(null);
  const streamingMessageRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize chat interface
  const initializeChat = useCallback(() => {
    if (!chatRef.current) {
      chatRef.current = new ChatInterface({
        apiKey: options.apiKey,
        model: options.model || 'gemini-1.5-flash',
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 1000,
        systemPrompt: options.systemPrompt || "You are a helpful AI assistant focused on providing clear, accurate, and engaging responses.",
        messageHistory: true,
        errorHandling: {
          retries: 3,
          fallbackMessage: "I apologize, but I'm having trouble processing your request. Please try again or rephrase your question."
        }
      });
    }
  }, [options]);

  // Stop streaming function
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isStreaming: false,
      isLoading: false,
      currentStreamingMessage: ''
    }));
  }, []);

  // Send message function
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    initializeChat();

    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: Date.now(),
      messageId: `user_${Date.now()}`
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
      isStreaming: options.enableStreaming || false,
      currentStreamingMessage: ''
    }));

    streamingMessageRef.current = '';
    abortControllerRef.current = new AbortController();

    const callbacks: StreamCallbacks = {
      onTokenReceived: (token: string) => {
        streamingMessageRef.current += token;
        setState(prev => ({
          ...prev,
          currentStreamingMessage: streamingMessageRef.current
        }));
      },
      onProgress: (progress: number) => {
        // Handle progress if needed
      },
      onComplete: (fullMessage: string) => {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: fullMessage,
          timestamp: Date.now(),
          messageId: `assistant_${Date.now()}`
        };

        setState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
          isStreaming: false,
          currentStreamingMessage: ''
        }));
        
        abortControllerRef.current = null;
      },
      onError: (error: Error) => {
        if (error.name !== 'AbortError') {
          setState(prev => ({
            ...prev,
            error: error.message,
            isLoading: false,
            isStreaming: false,
            currentStreamingMessage: ''
          }));
        }
        abortControllerRef.current = null;
      }
    };

    try {
      const response = await chatRef.current!.sendMessage({
        role: 'user',
        content,
        stream: options.enableStreaming || false,
        callbacks: options.enableStreaming ? callbacks : undefined
      });

      if (!options.enableStreaming && response.success) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.message || '',
          timestamp: Date.now(),
          messageId: response.messageId || `assistant_${Date.now()}`
        };

        setState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false
        }));
      } else if (!response.success) {
        setState(prev => ({
          ...prev,
          error: response.error || 'Unknown error occurred',
          isLoading: false,
          isStreaming: false
        }));
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          isLoading: false,
          isStreaming: false,
          currentStreamingMessage: ''
        }));
      }
    }
  }, [options, initializeChat]);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
      isStreaming: false,
      currentStreamingMessage: ''
    });
    
    if (chatRef.current) {
      chatRef.current.clearHistory();
    }
  }, []);

  // Retry last message
  const retryLastMessage = useCallback(() => {
    const lastUserMessage = state.messages
      .slice()
      .reverse()
      .find(msg => msg.role === 'user');
    
    if (lastUserMessage) {
      // Remove messages after the last user message
      const lastUserIndex = state.messages.findIndex(msg => msg.messageId === lastUserMessage.messageId);
      setState(prev => ({
        ...prev,
        messages: prev.messages.slice(0, lastUserIndex + 1),
        error: null
      }));
      
      sendMessage(lastUserMessage.content);
    }
  }, [state.messages, sendMessage]);

  // Trim history if it gets too long
  const trimHistory = useCallback(() => {
    const maxMessages = options.maxHistoryMessages || 100;
    if (state.messages.length > maxMessages) {
      setState(prev => ({
        ...prev,
        messages: prev.messages.slice(-maxMessages)
      }));
      
      if (chatRef.current) {
        chatRef.current.trimHistory(maxMessages);
      }
    }
  }, [state.messages.length, options.maxHistoryMessages]);

  return {
    ...state,
    sendMessage,
    clearConversation,
    retryLastMessage,
    trimHistory,
    stopStreaming
  };
};