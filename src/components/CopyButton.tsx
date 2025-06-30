import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { useAccessibility } from './AccessibilityProvider';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
  showText?: boolean;
  successMessage?: string;
  onCopy?: (text: string, result: boolean) => void;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label = 'Copy to clipboard',
  className = '',
  size = 'md',
  variant = 'default',
  showText = false,
  successMessage = 'Copied!',
  onCopy
}) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const { addAnnouncement } = useAccessibility();

  const handleCopy = (text: string, result: boolean) => {
    if (result) {
      setCopied(true);
      setError(false);
      addAnnouncement(`${successMessage} Content copied to clipboard.`);
      
      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } else {
      setError(true);
      addAnnouncement('Failed to copy content to clipboard.');
      
      // Reset error after 3 seconds
      setTimeout(() => setError(false), 3000);
    }

    if (onCopy) {
      onCopy(text, result);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base'
  };

  const variantClasses = {
    default: `
      bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300
      dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:border-gray-600
      ${copied ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-600' : ''}
      ${error ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-600' : ''}
    `,
    ghost: `
      bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-800
      dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-200
      ${copied ? 'text-green-600 hover:text-green-700 dark:text-green-400' : ''}
      ${error ? 'text-red-600 hover:text-red-700 dark:text-red-400' : ''}
    `,
    outline: `
      bg-transparent border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50
      dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-800
      ${copied ? 'border-green-400 text-green-600 hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-900/20' : ''}
      ${error ? 'border-red-400 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-900/20' : ''}
    `
  };

  const baseClasses = `
    inline-flex items-center justify-center rounded-md font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transform hover:scale-105 active:scale-95
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;

  const getIcon = () => {
    if (error) return <AlertCircle className="w-4 h-4" />;
    if (copied) return <Check className="w-4 h-4" />;
    return <Copy className="w-4 h-4" />;
  };

  const getButtonText = () => {
    if (error) return 'Failed';
    if (copied) return successMessage;
    return 'Copy';
  };

  return (
    <CopyToClipboard text={text} onCopy={handleCopy}>
      <button
        className={baseClasses}
        aria-label={copied ? `${successMessage} Content copied` : label}
        title={copied ? successMessage : label}
        type="button"
      >
        {getIcon()}
        {showText && (
          <span className="ml-2">
            {getButtonText()}
          </span>
        )}
      </button>
    </CopyToClipboard>
  );
};

export default CopyButton;