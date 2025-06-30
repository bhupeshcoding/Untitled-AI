import React from 'react';
import { User, Bot } from 'lucide-react';
import { Message as MessageType } from '../types';
import { parseCodeBlocks } from '../utils/messageParser';
import CodeBlockRenderer from './CodeBlockRenderer';
import ResearchSummary from './ResearchSummary';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const { type, content, loading, imageUrl, summary } = message;
  
  const { textContent, codeBlocks } = parseCodeBlocks(content);
  
  const isUser = type === 'user';

  return (
    <div className={`flex gap-4 p-4 ${isUser ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}`}>
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
            : 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
        }`}>
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </div>
      </div>
      <div className="flex-1 space-y-2">
        <div className="font-medium text-sm text-gray-500 dark:text-gray-400">
          {isUser ? 'You' : 'Untitled AI'}
          {message.module && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700">{message.module}</span>}
        </div>
        
        {loading ? (
          <div className="flex space-x-2 my-2">
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        ) : (
          <>
            <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
              {textContent}
            </div>
            
            {imageUrl && (
              <div className="mt-4 rounded-lg overflow-hidden shadow-lg">
                <img src={imageUrl} alt="Generated" className="w-full h-auto" />
              </div>
            )}
            
            {summary && <ResearchSummary summary={summary} />}
            
            {codeBlocks.map((codeBlock, index) => (
              <CodeBlockRenderer key={index} codeBlock={codeBlock} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Message