import React from 'react';
import { Bot } from 'lucide-react';

interface StreamingMessageProps {
  content: string;
  isComplete: boolean;
}

const StreamingMessage: React.FC<StreamingMessageProps> = ({ content, isComplete }) => {
  return (
    <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-900">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
          <Bot className="w-5 h-5" />
        </div>
      </div>
      <div className="flex-1 space-y-2">
        <div className="font-medium text-sm text-gray-500 dark:text-gray-400">
          Untitled AI
          {!isComplete && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
              Typing...
            </span>
          )}
        </div>
        
        <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
          {content}
          {!isComplete && (
            <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamingMessage;