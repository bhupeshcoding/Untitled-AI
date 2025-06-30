import React, { useState } from 'react';
import { Menu, Moon, Sun, Trash, Info, Zap } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onClearConversation?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  isDarkMode, 
  toggleDarkMode, 
  onClearConversation 
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearConversation = () => {
    setShowConfirm(true);
  };

  const confirmClear = () => {
    if (onClearConversation) {
      onClearConversation();
    }
    setShowConfirm(false);
  };

  const cancelClear = () => {
    setShowConfirm(false);
  };

  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex items-center">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mr-3 shadow-lg">
                <Zap className="text-white h-4 w-4" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Untitled AI
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enhanced Chat Interface
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <button
              onClick={handleClearConversation}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Clear conversation"
            >
              <Trash className="h-5 w-5" />
            </button>
            
            <button
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Information"
            >
              <Info className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {showConfirm && (
        <div className="absolute inset-x-0 top-16 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-gray-800 dark:text-gray-200">Clear all messages in this conversation?</p>
            <div className="flex space-x-2">
              <button
                onClick={cancelClear}
                className="px-3 py-1 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmClear}
                className="px-3 py-1 text-sm rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;