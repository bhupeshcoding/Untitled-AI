import React from 'react';
import { CodeIcon, FileText, Search, Image, BookOpen } from 'lucide-react';
import { useConversation } from '../context/ConversationContext';
import { AIModule } from '../types';

interface ModuleSelectorProps {
  className?: string;
}

interface ModuleOption {
  id: AIModule;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const ModuleSelector: React.FC<ModuleSelectorProps> = ({ className = '' }) => {
  const { activeModule, setActiveModule } = useConversation();

  const modules: ModuleOption[] = [
    {
      id: 'query',
      label: 'Query',
      icon: <Search className="w-5 h-5" />,
      description: 'Ask questions and get detailed answers',
    },
    {
      id: 'code',
      label: 'Code',
      icon: <CodeIcon className="w-5 h-5" />,
      description: 'Generate and explain code examples',
    },
    {
      id: 'image',
      label: 'Image',
      icon: <Image className="w-5 h-5" />,
      description: 'Generate AI images from text descriptions',
    },
    {
      id: 'summarization',
      label: 'Summarize',
      icon: <FileText className="w-5 h-5" />,
      description: 'Condense long text into key points',
    },
    {
      id: 'research',
      label: 'Research',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'Analyze and summarize academic papers',
    },
      {
      id: 'summarise youtube',
      label: 'Research',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'Analyze and summarize youtube videos',
    }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">AI Modules</h2>
      </div>
      <div className="p-2">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => setActiveModule(module.id)}
            className={`w-full text-left px-4 py-3 rounded-md transition-all duration-200 flex items-start space-x-3 mb-2 ${
              activeModule === module.id
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div
              className={`p-2 rounded-md ${
                activeModule === module.id
                  ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {module.icon}
            </div>
            <div>
              <div className="font-medium">{module.label}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{module.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModuleSelector