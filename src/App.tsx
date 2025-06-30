import { useState, useEffect } from 'react';
import { useGeminiChat } from './hooks/useGeminiChat';
import { useAuth } from './hooks/useAuth';
import { useConversations } from './hooks/useConversations';
import { AccessibilityProvider } from './components/AccessibilityProvider';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import AccessibleMessageList from './components/AccessibleMessageList';
import AccessibleChatInput from './components/AccessibleChatInput';
import AuthForm from './components/AuthForm';
import LiveRegion from './components/LiveRegion';
import SkipLinks from './components/SkipLinks';
import { apiConfig, systemPrompts, features, successMessages } from './config/apiConfig';
import { Loader2, LogOut, MessageSquare, Plus, Settings } from 'lucide-react';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showSidebar, setShowSidebar] = useState(false);

  const { user, profile, loading: authLoading, signOut } = useAuth();
  const {
    conversations,
    currentConversation,
    messages,
    createConversation,
    selectConversation,
    addMessageToCurrentConversation,
    setMessages
  } = useConversations();

  // Check if API key is configured
  const isApiKeyConfigured = !!apiConfig.googleAI.apiKey;

  // Initialize Gemini chat with secure configuration
  const geminiChat = useGeminiChat({
    apiKey: apiConfig.googleAI.apiKey,
    model: apiConfig.googleAI.model,
    temperature: apiConfig.googleAI.temperature,
    maxTokens: apiConfig.googleAI.maxTokens,
    systemPrompt: systemPrompts.default,
    enableStreaming: features.streaming,
    maxHistoryMessages: 100,
  });

  // Setup dark mode based on system preferences
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    } else if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      setDarkMode(true);
    }

    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('darkMode') === null) {
        setDarkMode(e.matches);
      }
    };
    darkModeMediaQuery.addEventListener('change', handleChange);

    return () => {
      darkModeMediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Apply or remove dark class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Sync messages with current conversation
  useEffect(() => {
    setMessages(geminiChat.messages);
  }, [geminiChat.messages, setMessages]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const handleSendMessage = async (content: string) => {
    // Create new conversation if none exists
    if (!currentConversation) {
      const newConversation = await createConversation('New Conversation');
      if (!newConversation) return;
    }

    // Send message through Gemini chat
    await geminiChat.sendMessage(content);
  };

  // Save messages to database when they change
  useEffect(() => {
    if (currentConversation && geminiChat.messages.length > messages.length) {
      const newMessages = geminiChat.messages.slice(messages.length);
      newMessages.forEach(message => {
        addMessageToCurrentConversation(message);
      });
    }
  }, [geminiChat.messages, currentConversation, messages.length, addMessageToCurrentConversation]);

  const handleSignOut = async () => {
    await signOut();
    setShowSidebar(false);
  };

  const handleNewConversation = async () => {
    const newConversation = await createConversation();
    if (newConversation) {
      await selectConversation(newConversation);
      geminiChat.clearConversation();
    }
  };

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading Netlify AI...</p>
        </div>
      </div>
    );
  }

  // Show auth form if user is not logged in
  if (!user) {
    return (
      <AuthForm 
        mode={authMode} 
        onToggleMode={() => setAuthMode(prev => prev === 'signin' ? 'signup' : 'signin')} 
      />
    );
  }

  // Show API key configuration if not set
  if (!isApiKeyConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="max-w-lg mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Settings className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              🌍 Ready to Change the World with Code?
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Welcome {profile?.username || user.email}! Netlify AI is ready to support your coding journey. We just need to configure your API key to get started.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-6 text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm mr-2">1</span>
                Quick Setup Instructions:
              </h3>
              <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li className="flex items-start">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs mr-2 mt-0.5">✓</span>
                  Get your free API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Google AI Studio</a>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs mr-2 mt-0.5">✓</span>
                  Add it to your .env file as VITE_GOOGLE_AI_API_KEY
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs mr-2 mt-0.5">✓</span>
                  Restart the development server
                </li>
              </ol>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-6 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AccessibilityProvider>
      <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300">
        <SkipLinks />
        <LiveRegion />
        
        <AccessibilityToolbar />

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">Netlify AI</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {profile?.username || user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* New Conversation Button */}
            <div className="p-4">
              <button
                onClick={handleNewConversation}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Conversation
              </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => selectConversation(conversation)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentConversation?.id === conversation.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{conversation.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(conversation.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Overlay */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 mt-16 shadow-sm">
            <div className="px-4 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                        <span className="text-white font-bold text-xl">N</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Netlify AI
                      </h1>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        🌍 Supporting Everyone's Coding Journey
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">AI Ready</span>
                  </div>
                  
                  <button
                    onClick={toggleDarkMode}
                    className="p-3 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {darkMode ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Current Conversation Title */}
              {currentConversation && (
                <div className="mt-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentConversation.title}
                  </h2>
                </div>
              )}
            </div>
          </header>

          <main id="main-content" className="flex-1 flex flex-col">
            <AccessibleMessageList
              messages={messages}
              isStreaming={geminiChat.isStreaming}
              currentStreamingMessage={geminiChat.currentStreamingMessage}
              error={geminiChat.error}
            />
            <AccessibleChatInput
              onSendMessage={handleSendMessage}
              onRetry={geminiChat.retryLastMessage}
              isLoading={geminiChat.isLoading}
              isStreaming={geminiChat.isStreaming}
              stopStreaming={geminiChat.stopStreaming}
              error={geminiChat.error}
              placeholder="Ask me about coding, algorithms, or get help with your projects! Let's build something amazing together! 🌟"
            />
          </main>
        </div>
      </div>
    </AccessibilityProvider>
  );
}

export default App;