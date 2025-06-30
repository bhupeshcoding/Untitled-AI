import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip } from 'lucide-react';
import { useConversation } from '../context/ConversationContext';
import { AIModule } from '../types';

const moduleHints: Record<AIModule, string> = {
  query: 'Ask me anything...',
  code: 'Describe the code you need...',
  summarization: 'Paste text to summarize...',
};

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const { sendMessage, activeModule } = useConversation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
      
      // Reset textarea height
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

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-b-lg">
      <div className="relative flex items-center">
        <button
          type="button"
          className="absolute left-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={moduleHints[activeModule]}
          className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-md py-3 pl-10 pr-16 resize-none max-h-32 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none text-gray-800 dark:text-gray-200"
          rows={1}
        />
        
        <div className="absolute right-3 flex items-center space-x-2">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Voice input"
          >
            <Mic className="h-5 w-5" />
          </button>
          
          <button
            type="submit"
            disabled={!message.trim()}
            className={`rounded-full p-1.5 transition-colors ${
              message.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex justify-between items-center">
        <span>Shift+Enter for new line</span>
        <span>{message.length} characters</span>
      </div>
    </form>
  );
};

export default ChatInput;