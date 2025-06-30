export type MessageType = 'user' | 'ai';

export type AIModule = 'summarization' | 'code' | 'image' | 'query' | 'research';

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  module?: AIModule;
  codeBlocks?: CodeBlock[];
  imageUrl?: string;
  loading?: boolean;
  summary?: ResearchSummary;
}

export interface CodeBlock {
  id: string;
  code: string;
  language: string;
}

export interface ResearchSummary {
  problem: string;
  method: string;
  findings: string;
  application: string;
}

export interface ConversationContextType {
  messages: Message[];
  activeModule: AIModule;
  setActiveModule: (module: AIModule) => void;
  sendMessage: (content: string) => void;
  clearConversation: () => void;
}