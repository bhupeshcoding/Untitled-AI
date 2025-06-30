import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { Message, AIModule, ConversationContextType, ResearchSummary } from '../types';

const defaultContextValue: ConversationContextType = {
  messages: [],
  activeModule: 'query',
  setActiveModule: () => {},
  sendMessage: () => {},
  clearConversation: () => {},
};

const ConversationContext = createContext<ConversationContextType>(defaultContextValue);

export const useConversation = () => useContext(ConversationContext);

const generateImage = async (prompt: string): Promise<string> => {
  const response = await axios.post(
    'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2',
    { inputs: prompt },
    {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_HUGGING_FACE_TOKEN}`,
      },
      responseType: 'blob',
    }
  );

  const imageBlob = new Blob([response.data]);
  return URL.createObjectURL(imageBlob);
};

const extractArxivId = (text: string): string | null => {
  // Match arXiv ID pattern: YYMM.NNNNN or YYMM.NNNNNN
  const match = text.match(/\d{4}\.\d{4,6}/);
  return match ? match[0] : null;
};

const generateResearchSummary = async (text: string): Promise<ResearchSummary> => {
  const paperId = extractArxivId(text);
  
  if (!paperId) {
    throw new Error('Please provide a valid arXiv paper ID (e.g., 2301.12345) to generate a summary.');
  }

  try {
    const response = await axios.post('/api/summarize', { paperId });
    
    if (response.data.results.error) {
      throw new Error(response.data.results.error);
    }
    
    return response.data.results;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error(`Paper with ID ${paperId} not found. Please check the ID and try again.`);
    }
    throw new Error('Failed to generate research summary. Please try again later.');
  }
};

const generateAIResponse = async (message: string, module: AIModule): Promise<{ content: string; imageUrl?: string; summary?: ResearchSummary }> => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      switch (module) {
        case 'research':
          try {
            const summary = await generateResearchSummary(message);
            resolve({
              content: 'Here\'s a summary of the research paper:',
              summary
            });
          } catch (error) {
            resolve({
              content: error instanceof Error ? error.message : 'An unexpected error occurred while generating the summary.'
            });
          }
          break;
        case 'image':
          try {
            const imageUrl = await generateImage(message);
            resolve({
              content: 'Here\'s your generated image based on the prompt:',
              imageUrl
            });
          } catch (error) {
            resolve({
              content: 'Sorry, there was an error generating the image. Please try again with a different prompt.'
            });
          }
          break;
        case 'summarization':
          resolve({
            content: `Here's a summary of what you asked about:\n\n${message.length > 50 ? message.substring(0, 50) + '...' : message}\n\nThe key points are...[summary would continue]`
          });
          break;
        case 'code':
          resolve({
            content: `Based on your request, here's the code:\n\n\`\`\`javascript\n// Implementation for "${message}"\nfunction example() {\n  console.log("This is sample code");\n  return "Hello, world!";\n}\n\`\`\``
          });
          break;
        case 'query':
        default:
          resolve({
            content: `I've analyzed your query: "${message}"\n\nHere's what I found...[answer would continue]`
          });
      }
    }, 1500);
  });
};

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeModule, setActiveModule] = useState<AIModule>('query');

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMessage: Message = {
        id: uuidv4(),
        type: 'user',
        content,
        timestamp: new Date(),
        module: activeModule,
      };

      const aiMessageId = uuidv4();
      const aiLoadingMessage: Message = {
        id: aiMessageId,
        type: 'ai',
        content: '',
        timestamp: new Date(),
        module: activeModule,
        loading: true,
      };

      setMessages((prev) => [...prev, userMessage, aiLoadingMessage]);

      const aiResponse = await generateAIResponse(content, activeModule);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: aiResponse.content,
                imageUrl: aiResponse.imageUrl,
                summary: aiResponse.summary,
                loading: false,
              }
            : msg
        )
      );
    },
    [activeModule]
  );

  const clearConversation = useCallback(() => {
    setMessages([]);
  }, []);

  const value = {
    messages,
    activeModule,
    setActiveModule,
    sendMessage,
    clearConversation,
  };

  return <ConversationContext.Provider value={value}>{children}</ConversationContext.Provider>;
};