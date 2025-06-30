import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, RotateCcw, Square, FileText } from 'lucide-react';
import { useAccessibility } from './AccessibilityProvider';
import PDFUploader from './PDFUploader';

interface AccessibleChatInputProps {
  onSendMessage: (message: string) => void;
  onRetry?: () => void;
  isLoading: boolean;
  isStreaming: boolean;
  stopStreaming?: () => void;
  error: string | null;
  placeholder?: string;
  disabled?: boolean;
}

const AccessibleChatInput: React.FC<AccessibleChatInputProps> = ({
  onSendMessage,
  onRetry,
  isLoading,
  isStreaming,
  stopStreaming,
  error,
  placeholder = "Type your message...",
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showPDFUploader, setShowPDFUploader] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addAnnouncement } = useAccessibility();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Announce status changes
  useEffect(() => {
    if (isLoading) {
      addAnnouncement('AI is processing your message');
    } else if (isStreaming) {
      addAnnouncement('AI is responding with streaming text');
    }
  }, [isLoading, isStreaming, addAnnouncement]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !isStreaming && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      addAnnouncement('Message sent');
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        addAnnouncement('Voice recording started. Speak now.');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + transcript);
        addAnnouncement(`Voice input received: ${transcript}`);
      };

      recognition.onerror = (event: any) => {
        addAnnouncement(`Voice recognition error: ${event.error}`);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        addAnnouncement('Voice recording ended');
      };

      recognition.start();
    } else {
      addAnnouncement('Voice recognition is not supported in this browser');
    }
  };

  const handlePDFSummary = (summary: string, fileName: string) => {
    const pdfMessage = `I've uploaded a PDF document "${fileName}". Here's the AI-generated summary:\n\n${summary}`;
    onSendMessage(pdfMessage);
    setShowPDFUploader(false);
    addAnnouncement(`PDF summary for ${fileName} has been added to the conversation`);
  };

  const canSend = message.trim() && !isLoading && !isStreaming && !disabled;
  const characterCount = message.length;
  const maxCharacters = 2000;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {error && (
        <div 
          className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error occurred
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center px-3 py-2 text-sm text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Retry last message"
              >
                <RotateCcw className="w-4 h-4 mr-1" aria-hidden="true" />
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* PDF Uploader Modal */}
      {showPDFUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                📄 Upload PDF for Analysis
              </h3>
              <button
                onClick={() => setShowPDFUploader(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                aria-label="Close PDF uploader"
              >
                ×
              </button>
            </div>
            <div className="p-4 max-h-[calc(90vh-120px)] overflow-auto">
              <PDFUploader
                onSummaryGenerated={handlePDFSummary}
                maxFileSize={10}
                className="border-0 shadow-none"
              />
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-4">
        <div className="relative">
          <label htmlFor="message-input" className="sr-only">
            Type your message to the AI assistant
          </label>
          
          <textarea
            id="message-input"
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading || isStreaming}
            maxLength={maxCharacters}
            className="w-full bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg py-3 pl-4 pr-32 resize-none max-h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            rows={1}
            aria-describedby="message-help character-count"
            aria-invalid={error ? 'true' : 'false'}
          />
          
          <div className="absolute right-2 bottom-2 flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setShowPDFUploader(true)}
              disabled={disabled || isLoading || isStreaming}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              aria-label="Upload PDF document"
              title="Upload PDF for analysis"
            >
              <FileText className="h-5 w-5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={handleVoiceInput}
              disabled={disabled || isLoading || isStreaming || isRecording}
              className={`p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isRecording
                  ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50'
              }`}
              aria-label={isRecording ? 'Recording voice input' : 'Start voice input'}
            >
              {isRecording ? (
                <div className="w-5 h-5 bg-red-500 rounded-full animate-pulse" />
              ) : (
                <Mic className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
            
            {isStreaming && stopStreaming ? (
              <button
                type="button"
                onClick={stopStreaming}
                className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-400 dark:hover:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Stop AI response"
              >
                <Square className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSend}
                className={`p-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  canSend
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-lg'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
                aria-label="Send message"
              >
                {isLoading || isStreaming ? (
                  <div 
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" 
                    aria-hidden="true"
                  />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
          <div id="message-help">
            {isStreaming ? (
              <span aria-live="polite">AI is responding...</span>
            ) : (
              <span>
                Press Shift+Enter for new line, Enter to send • 
                <button
                  type="button"
                  onClick={() => setShowPDFUploader(true)}
                  className="ml-1 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Upload PDF
                </button>
              </span>
            )}
          </div>
          <div 
            id="character-count"
            className={characterCount > maxCharacters * 0.9 ? 'text-orange-500' : ''}
            aria-live="polite"
          >
            {characterCount}/{maxCharacters} characters
          </div>
        </div>
      </form>
    </div>
  );
};

export default AccessibleChatInput;