import React, { useRef, useEffect } from 'react';
import { User, Bot, AlertCircle, Clock, Code, Lightbulb, Target, Download } from 'lucide-react';
import { ChatMessage } from '../services/geminiChat';
import { useAccessibility } from './AccessibilityProvider';
import ReactMarkdown from 'react-markdown';
import CodeBlock from './CodeBlock';
import CopyButton from './CopyButton';
import LinkedInPDFGenerator from './LinkedInPDFGenerator';

interface AccessibleMessageListProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  currentStreamingMessage: string;
  error: string | null;
}

const AccessibleMessageList: React.FC<AccessibleMessageListProps> = ({
  messages,
  isStreaming,
  currentStreamingMessage,
  error
}) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const { addAnnouncement } = useAccessibility();

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentStreamingMessage]);

  // Announce new messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        addAnnouncement('Netlify AI response received');
      }
    }
  }, [messages, addAnnouncement]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMessageId = (message: ChatMessage, index: number) => {
    return message.messageId || `message-${index}`;
  };

  const handlePDFSuccess = (filename: string, shareableText: string) => {
    addAnnouncement(`LinkedIn-ready PDF exported successfully as ${filename}. Shareable content prepared!`);
  };

  const handlePDFError = (error: string) => {
    addAnnouncement(`LinkedIn PDF export failed: ${error}`);
  };

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 overflow-y-auto" role="main" aria-label="Chat conversation">
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="relative mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform">
              <Bot className="h-10 w-10 text-white" aria-hidden="true" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-3 border-white dark:border-gray-800 animate-pulse"></div>
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Welcome to Netlify AI! 🚀
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed mb-8 text-lg">
            Your intelligent coding companion is ready to help you master LeetCode problems, 
            understand algorithms, and accelerate your programming journey. Let's code something amazing together!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                🎯 LeetCode Mastery
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get step-by-step solutions for the top 150 LeetCode problems with detailed explanations
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                💻 Smart Code Analysis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload your code for instant feedback, optimization tips, and complexity analysis
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                💡 Personalized Learning
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Adaptive recommendations based on your progress and coding style
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
              🌟 Try asking me:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="mr-2">•</span>
                "Explain the Two Sum problem"
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="mr-2">•</span>
                "How do I approach dynamic programming?"
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="mr-2">•</span>
                "What's the best way to practice coding?"
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="mr-2">•</span>
                "Motivate me to keep coding!"
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-accessible" role="main" aria-label="Chat conversation">
      {/* Enhanced Export Options */}
      {messages.length > 0 && (
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                📄 Export Options:
              </span>
              <LinkedInPDFGenerator 
                messages={messages}
                title="AI Conversation Insights"
                variant="premium"
                size="sm"
                onSuccess={handlePDFSuccess}
                onError={handlePDFError}
              />
            </div>
            <div className="flex items-center space-x-2">
              <CopyButton
                text={messages.map(m => `${m.role === 'user' ? 'You' : 'Netlify AI'}: ${m.content}`).join('\n\n')}
                label="Copy entire conversation"
                showText
                size="sm"
                variant="outline"
                successMessage="Conversation copied!"
              />
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-3 py-2 rounded-lg">
            💡 <strong>LinkedIn-Ready:</strong> Professional formatting with margins, headings, insights, and shareable content for maximum engagement!
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {messages.map((message, index) => {
          const messageId = getMessageId(message, index);
          const isUser = message.role === 'user';
          
          return (
            <article
              key={messageId}
              id={messageId}
              className={`flex gap-4 p-6 ${
                isUser 
                  ? 'bg-white dark:bg-gray-800' 
                  : 'bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10'
              }`}
              aria-labelledby={`${messageId}-author`}
            >
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                  isUser
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                    : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                }`}>
                  {isUser ? (
                    <User className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Bot className="w-5 h-5" aria-hidden="true" />
                  )}
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                <header className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h3 
                      id={`${messageId}-author`}
                      className="font-semibold text-gray-800 dark:text-gray-200"
                    >
                      {isUser ? 'You' : 'Netlify AI'}
                      {!isUser && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          🤖 AI
                        </span>
                      )}
                    </h3>
                    <CopyButton
                      text={message.content}
                      label={`Copy ${isUser ? 'your' : 'AI'} message`}
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <time 
                    dateTime={new Date(message.timestamp).toISOString()}
                    className="text-sm text-gray-500 dark:text-gray-400 flex items-center"
                    aria-label={`Message sent at ${formatTimestamp(message.timestamp)}`}
                  >
                    <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                    {formatTimestamp(message.timestamp)}
                  </time>
                </header>
                
                <div className="text-gray-800 dark:text-gray-200 leading-relaxed group">
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <ReactMarkdown 
                      className="prose prose-sm dark:prose-invert max-w-none prose-blue"
                      components={{
                        code: ({ node, inline, className, children, ...props }) => {
                          const match = /language-(\w+)/.exec(className || '');
                          const language = match ? match[1] : 'text';
                          const code = String(children).replace(/\n$/, '');
                          
                          return !inline ? (
                            <CodeBlock
                              code={code}
                              language={language}
                              showLineNumbers={true}
                              className="my-4"
                            />
                          ) : (
                            <code 
                              className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono" 
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                        h1: ({ children, ...props }) => (
                          <h1 className="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100" {...props}>{children}</h1>
                        ),
                        h2: ({ children, ...props }) => (
                          <h2 className="text-lg font-semibold mt-3 mb-2 text-gray-900 dark:text-gray-100" {...props}>{children}</h2>
                        ),
                        h3: ({ children, ...props }) => (
                          <h3 className="text-base font-medium mt-2 mb-1 text-gray-900 dark:text-gray-100" {...props}>{children}</h3>
                        ),
                        ul: ({ children, ...props }) => (
                          <ul className="list-disc list-inside space-y-1 text-gray-800 dark:text-gray-200" {...props}>{children}</ul>
                        ),
                        ol: ({ children, ...props }) => (
                          <ol className="list-decimal list-inside space-y-1 text-gray-800 dark:text-gray-200" {...props}>{children}</ol>
                        ),
                        blockquote: ({ children, ...props }) => (
                          <blockquote 
                            className="border-l-4 border-blue-400 dark:border-blue-500 pl-4 italic bg-blue-50 dark:bg-blue-900/20 py-2 rounded-r-lg" 
                            {...props}
                          >
                            {children}
                          </blockquote>
                        ),
                        strong: ({ children, ...props }) => (
                          <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props}>{children}</strong>
                        )
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            </article>
          );
        })}
        
        {isStreaming && currentStreamingMessage && (
          <article 
            className="flex gap-4 p-6 bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10"
            aria-live="polite"
            aria-label="Netlify AI is currently responding"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
                <Bot className="w-5 h-5" aria-hidden="true" />
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <header className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  Netlify AI
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 animate-pulse">
                    ✨ Thinking...
                  </span>
                </h3>
              </header>
              
              <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
                <ReactMarkdown 
                  className="prose prose-sm dark:prose-invert max-w-none prose-blue"
                  components={{
                    code: ({ node, inline, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : 'text';
                      const code = String(children).replace(/\n$/, '');
                      
                      return !inline ? (
                        <CodeBlock
                          code={code}
                          language={language}
                          showLineNumbers={true}
                          className="my-4"
                        />
                      ) : (
                        <code 
                          className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono" 
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {currentStreamingMessage}
                </ReactMarkdown>
                <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse" aria-hidden="true" />
              </div>
            </div>
          </article>
        )}
        
        {error && (
          <div 
            className="flex gap-4 p-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300">
                <AlertCircle className="w-5 h-5" aria-hidden="true" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                Oops! Something went wrong
              </h3>
              <p className="text-red-700 dark:text-red-300">
                {error}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                💪 Don't worry! Every error is a step closer to success. Try again!
              </p>
            </div>
          </div>
        )}
      </div>
      <div ref={endOfMessagesRef} aria-hidden="true" />
    </div>
  );
};

export default AccessibleMessageList;