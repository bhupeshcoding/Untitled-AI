import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CopyButton from './CopyButton';
import { useAccessibility } from './AccessibilityProvider';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
  maxHeight?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'text',
  filename,
  showLineNumbers = true,
  className = '',
  maxHeight = '400px'
}) => {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const { addAnnouncement } = useAccessibility();

  // Listen for dark mode changes
  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const handleCopy = (text: string, result: boolean) => {
    if (result) {
      addAnnouncement(`Code copied to clipboard. ${code.split('\n').length} lines copied.`);
    }
  };

  const getLanguageDisplayName = (lang: string) => {
    const languageMap: Record<string, string> = {
      'js': 'JavaScript',
      'jsx': 'React JSX',
      'ts': 'TypeScript',
      'tsx': 'React TSX',
      'py': 'Python',
      'cpp': 'C++',
      'c': 'C',
      'java': 'Java',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'json': 'JSON',
      'xml': 'XML',
      'sql': 'SQL',
      'bash': 'Bash',
      'sh': 'Shell',
      'yaml': 'YAML',
      'yml': 'YAML',
      'md': 'Markdown',
      'php': 'PHP',
      'rb': 'Ruby',
      'go': 'Go',
      'rust': 'Rust',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      'dart': 'Dart',
      'r': 'R',
      'matlab': 'MATLAB',
      'text': 'Plain Text'
    };
    
    return languageMap[lang.toLowerCase()] || lang.toUpperCase();
  };

  return (
    <div className={`group relative my-4 rounded-lg overflow-hidden bg-gray-900 dark:bg-gray-800 border border-gray-700 dark:border-gray-600 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-700 border-b border-gray-700 dark:border-gray-600">
        <div className="flex items-center space-x-3">
          {/* Traffic light dots */}
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          
          <div className="flex items-center space-x-2">
            {filename && (
              <span className="text-sm font-medium text-gray-300 dark:text-gray-400">
                {filename}
              </span>
            )}
            <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-md">
              {getLanguageDisplayName(language)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {code.split('\n').length} lines
          </span>
          <CopyButton
            text={code}
            label={`Copy ${getLanguageDisplayName(language)} code`}
            variant="ghost"
            size="sm"
            onCopy={handleCopy}
            className="opacity-70 hover:opacity-100 text-gray-300 hover:text-white"
          />
        </div>
      </div>
      
      {/* Code Content */}
      <div 
        className="relative overflow-auto"
        style={{ maxHeight }}
        role="region"
        aria-label={`Code block in ${getLanguageDisplayName(language)}`}
      >
        <SyntaxHighlighter
          language={language}
          style={isDarkMode ? oneDark : oneLight}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.5',
          }}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: isDarkMode ? '#6b7280' : '#9ca3af',
            borderRight: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            marginRight: '1em',
          }}
          codeTagProps={{
            style: {
              fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',
            }
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
      
      {/* Quick Actions Overlay */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-md p-1">
          <CopyButton
            text={code}
            label="Copy code"
            variant="ghost"
            size="sm"
            onCopy={handleCopy}
            className="text-white hover:bg-white/20"
          />
        </div>
      </div>
    </div>
  );
};

export default CodeBlock;