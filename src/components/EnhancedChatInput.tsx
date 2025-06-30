import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, RotateCcw } from 'lucide-react';

interface EnhancedChatInputProps {
  onSendMessage: (message: string) => void;
  onRetry?: () => void;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  placeholder?: string;
  disabled?: boolean;
}

const EnhancedChatInput: React.FC<EnhancedChatInputProps> = ({
  onSendMessage,
  onRetry,
  isLoading,
  isStreaming,
  error,
  placeholder = "Type your message...",
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !isStreaming && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = message.trim() && !isLoading && !isStreaming && !disabled;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800 rounded-md transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Retry
              </button>
            )}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-4">
        <div className="relative flex items-end">
          <button
            type="button"
            className="absolute left-3 bottom-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Attach file"
            disabled={disabled}
          >
            <Paperclip className="h-5 w-5" />
          </button>
          
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading || isStreaming}
            className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-lg py-3 pl-10 pr-20 resize-none max-h-32 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none text-gray-800 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
          />
          
          <div className="absolute right-3 bottom-3 flex items-center space-x-2">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
              aria-label="Voice input"
              disabled={disabled || isLoading || isStreaming}
            >
              <Mic className="h-5 w-5" />
            </button>
            
            <button
              type="submit"
              disabled={!canSend}
              className={`rounded-full p-2 transition-all duration-200 ${
                canSend
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-lg'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              {isLoading || isStreaming ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex justify-between items-center">
          <span>
            {isStreaming ? 'AI is responding...' : 'Shift+Enter for new line'}
          </span>
          <span>{message.length} characters</span>
        </div>
      </form>
    </div>
  );
};

export default EnhancedChatInput;