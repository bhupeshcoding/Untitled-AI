import React, { useRef, useEffect } from 'react';
import { User, Bot, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../services/geminiChat';
import StreamingMessage from './StreamingMessage';
import ReactMarkdown from 'react-markdown';

interface EnhancedMessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  currentStreamingMessage: string;
  error: string | null;
}

const EnhancedMessageList: React.FC<EnhancedMessageListProps> = ({
  messages,
  isStreaming,
  currentStreamingMessage,
  error
}) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentStreamingMessage]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Welcome to Enhanced AI Chat
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md leading-relaxed">
            Start a conversation with our advanced AI assistant. Experience real-time streaming responses, 
            intelligent error handling, and seamless conversation management.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Real-time streaming
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Smart error handling
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Context awareness
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              Markdown support
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {messages.map((message) => (
          <div
            key={message.messageId}
            className={`flex gap-4 p-4 ${
              message.role === 'user' 
                ? 'bg-white dark:bg-gray-800' 
                : 'bg-gray-50 dark:bg-gray-900'
            }`}
          >
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm text-gray-500 dark:text-gray-400">
                  {message.role === 'user' ? 'You' : 'Untitled AI'}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
              
              <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
                {message.role === 'assistant' ? (
                  <ReactMarkdown 
                    className="prose prose-sm dark:prose-invert max-w-none"
                    components={{
                      code: ({ node, inline, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline ? (
                          <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm" {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isStreaming && currentStreamingMessage && (
          <StreamingMessage 
            content={currentStreamingMessage} 
            isComplete={false}
          />
        )}
        
        {error && (
          <div className="flex gap-4 p-4 bg-red-50 dark:bg-red-900/20">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm text-red-600 dark:text-red-400 mb-1">
                Error
              </div>
              <div className="text-red-700 dark:text-red-300 text-sm">
                {error}
              </div>
            </div>
          </div>
        )}
      </div>
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default EnhancedMessageList;