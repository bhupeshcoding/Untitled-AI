import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  messageId: string;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  messageId?: string;
  error?: string;
  processTime?: number;
}

export interface StreamCallbacks {
  onTokenReceived?: (token: string) => void;
  onProgress?: (progress: number) => void;
  onComplete?: (fullMessage: string) => void;
  onError?: (error: Error) => void;
}

export interface SendMessageOptions {
  role: 'user' | 'assistant' | 'system';
  content: string;
  stream?: boolean;
  callbacks?: StreamCallbacks;
}

export interface ConversationConfig {
  maxMessages: number;
  persistHistory: boolean;
  contextWindow: number;
  formatResponse: (message: any) => {
    text: string;
    timestamp: number;
    metadata: {
      model: string;
      processTime?: number;
    };
  };
}

export interface ErrorConfig {
  maxRetries: number;
  retryDelay: number;
  fallbackBehavior: string;
  errorTypes: {
    API_ERROR: string;
    RATE_LIMIT: string;
    CONTEXT_LENGTH: string;
  };
}

export interface StreamConfig {
  enabled: boolean;
  chunkSize: number;
  updateInterval: number;
  bufferSize: number;
  onProgress?: (progress: number) => void;
}

export class ChatInterface {
  private googleai: GoogleGenerativeAI;
  private model: any;
  private chat: any;
  private apiKey: string;
  private modelName: string;
  private temperature: number;
  private maxTokens: number;
  private systemPrompt: string;
  private messageHistory: boolean;
  private errorHandling: {
    retries: number;
    fallbackMessage: string;
  };
  private conversationHistory: ChatMessage[] = [];

  constructor(config: {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    messageHistory: boolean;
    errorHandling: {
      retries: number;
      fallbackMessage: string;
    };
  }) {
    this.apiKey = config.apiKey;
    this.modelName = config.model;
    this.temperature = config.temperature;
    this.maxTokens = config.maxTokens;
    this.systemPrompt = config.systemPrompt;
    this.messageHistory = config.messageHistory;
    this.errorHandling = config.errorHandling;

    this.googleai = new GoogleGenerativeAI(this.apiKey);
    this.model = this.googleai.getGenerativeModel({ 
      model: this.modelName,
      generationConfig: {
        temperature: this.temperature,
        maxOutputTokens: this.maxTokens,
      }
    });

    this.initializeChat();
  }

  private initializeChat() {
    const history = this.messageHistory ? this.conversationHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })) : [];

    this.chat = this.model.startChat({
      history,
      systemInstruction: {
        parts: [{ text: this.systemPrompt }]
      }
    });
  }

  async sendMessage(options: SendMessageOptions): Promise<ChatResponse> {
    const startTime = Date.now();
    const messageId = this.generateMessageId();

    // Add user message to history
    if (this.messageHistory) {
      this.conversationHistory.push({
        role: options.role,
        content: options.content,
        timestamp: Date.now(),
        messageId
      });
    }

    let retries = 0;
    while (retries < this.errorHandling.retries) {
      try {
        if (options.stream && options.callbacks) {
          return await this.handleStreamingResponse(options, messageId, startTime);
        } else {
          return await this.handleRegularResponse(options, messageId, startTime);
        }
      } catch (error) {
        retries++;
        if (retries >= this.errorHandling.retries) {
          return this.handleError(error, messageId);
        }
        await this.delay(1000 * retries); // Exponential backoff
      }
    }

    return {
      success: false,
      error: this.errorHandling.fallbackMessage,
      messageId
    };
  }

  private async handleStreamingResponse(
    options: SendMessageOptions, 
    messageId: string, 
    startTime: number
  ): Promise<ChatResponse> {
    try {
      const result = await this.chat.sendMessageStream(options.content);
      let fullMessage = '';
      let progress = 0;

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullMessage += chunkText;
        progress += chunkText.length;

        if (options.callbacks?.onTokenReceived) {
          options.callbacks.onTokenReceived(chunkText);
        }

        if (options.callbacks?.onProgress) {
          options.callbacks.onProgress(progress);
        }
      }

      const processTime = Date.now() - startTime;

      // Add assistant response to history
      if (this.messageHistory) {
        this.conversationHistory.push({
          role: 'assistant',
          content: fullMessage,
          timestamp: Date.now(),
          messageId: this.generateMessageId()
        });
      }

      if (options.callbacks?.onComplete) {
        options.callbacks.onComplete(fullMessage);
      }

      return {
        success: true,
        message: fullMessage,
        messageId,
        processTime
      };
    } catch (error) {
      if (options.callbacks?.onError) {
        options.callbacks.onError(error as Error);
      }
      throw error;
    }
  }

  private async handleRegularResponse(
    options: SendMessageOptions, 
    messageId: string, 
    startTime: number
  ): Promise<ChatResponse> {
    const result = await this.chat.sendMessage(options.content);
    const responseText = result.response.text();
    const processTime = Date.now() - startTime;

    // Add assistant response to history
    if (this.messageHistory) {
      this.conversationHistory.push({
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
        messageId: this.generateMessageId()
      });
    }

    return {
      success: true,
      message: responseText,
      messageId,
      processTime
    };
  }

  private handleError(error: any, messageId: string): ChatResponse {
    console.error('Chat error:', error);
    
    let errorType = 'API_ERROR';
    if (error.message?.includes('rate limit')) {
      errorType = 'RATE_LIMIT';
    } else if (error.message?.includes('context length')) {
      errorType = 'CONTEXT_LENGTH';
    }

    return {
      success: false,
      error: this.errorHandling.fallbackMessage,
      messageId
    };
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  clearHistory(): void {
    this.conversationHistory = [];
    this.initializeChat();
  }

  trimHistory(maxMessages: number): void {
    if (this.conversationHistory.length > maxMessages) {
      this.conversationHistory = this.conversationHistory.slice(-maxMessages);
      this.initializeChat();
    }
  }
}