import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { CodeBlock } from '../types';

interface CodeBlockRendererProps {
  codeBlock: CodeBlock;
  className?: string;
}

const CodeBlockRenderer: React.FC<CodeBlockRendererProps> = ({ codeBlock, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(codeBlock.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`group relative my-4 rounded-lg overflow-hidden bg-gray-800 ${className}`}>
      <div className="flex items-center justify-between p-2 bg-gray-900 text-gray-300 text-sm border-b border-gray-700">
        <span>{codeBlock.language}</span>
        <button
          onClick={copyToClipboard}
          className="p-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          aria-label="Copy code"
        >
          {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-gray-300">
        <code>{codeBlock.code}</code>
      </pre>
    </div>
  );
};

export default CodeBlockRenderer;