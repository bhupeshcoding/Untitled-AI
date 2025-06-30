import React, { useRef, useEffect } from 'react';
import { useConversation } from '../context/ConversationContext';
import Message from './Message';

const MessageList: React.FC = () => {
  const { messages } = useConversation();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 mb-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg\" className="h-8 w-8 text-blue-600 dark:text-blue-400\" fill="none\" viewBox="0 0 24 24\" stroke="currentColor">
              <path strokeLinecap="round\" strokeLinejoin="round\" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Welcome to Untitled AI</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            Select an AI module and start typing to begin your conversation.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </div>
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;