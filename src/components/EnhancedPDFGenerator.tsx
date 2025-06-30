import React, { useState } from 'react';
import { Download, FileText, Loader2, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { pdfGenerationService, PDFGenerationOptions, PDFGenerationResult } from '../services/pdfGenerationService';
import { ChatMessage } from '../services/geminiChat';
import { useAccessibility } from './AccessibilityProvider';

interface EnhancedPDFGeneratorProps {
  messages: ChatMessage[];
  title?: string;
  filename?: string;
  className?: string;
  variant?: 'button' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg';
  options?: Partial<PDFGenerationOptions>;
  onSuccess?: (filename: string) => void;
  onError?: (error: string) => void;
  showPreview?: boolean;
}

interface GenerationState {
  isGenerating: boolean;
  progress: number;
  status: 'idle' | 'validating' | 'generating' | 'saving' | 'success' | 'error';
  result?: PDFGenerationResult;
}

const EnhancedPDFGenerator: React.FC<EnhancedPDFGeneratorProps> = ({
  messages,
  title = 'AI Conversation',
  filename,
  className = '',
  variant = 'button',
  size = 'md',
  options = {},
  onSuccess,
  onError,
  showPreview = false
}) => {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    status: 'idle'
  });
  const [showOptions, setShowOptions] = useState(false);
  const [pdfOptions, setPdfOptions] = useState<Partial<PDFGenerationOptions>>({
    pageFormat: 'letter',
    includeTimestamps: true,
    includeMetadata: false,
    includeHeader: false,
    includeFooter: false,
    ...options
  });

  const { addAnnouncement } = useAccessibility();

  const handleGeneratePDF = async () => {
    // Validate messages
    const validation = pdfGenerationService.validateMessages(messages);
    if (!validation.valid) {
      setState(prev => ({ ...prev, status: 'error', result: { success: false, error: validation.error } }));
      addAnnouncement(`PDF generation failed: ${validation.error}`);
      if (onError) onError(validation.error!);
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true, status: 'validating', progress: 10 }));
    addAnnouncement('Starting clean PDF generation...');

    try {
      // Simulate progress updates
      setState(prev => ({ ...prev, status: 'generating', progress: 30 }));
      await new Promise(resolve => setTimeout(resolve, 300));

      setState(prev => ({ ...prev, progress: 60 }));
      
      // Generate PDF with clean options
      const result = await pdfGenerationService.generatePDF(
        messages,
        title,
        filename,
        pdfOptions
      );

      setState(prev => ({ ...prev, status: 'saving', progress: 90 }));
      await new Promise(resolve => setTimeout(resolve, 200));

      if (result.success) {
        setState(prev => ({ 
          ...prev, 
          status: 'success', 
          progress: 100, 
          result,
          isGenerating: false 
        }));
        
        addAnnouncement(`Clean PDF generated successfully: ${result.filename}`);
        if (onSuccess) onSuccess(result.filename!);
        
        // Reset after 3 seconds
        setTimeout(() => {
          setState(prev => ({ ...prev, status: 'idle', progress: 0 }));
        }, 3000);
      } else {
        throw new Error(result.error || 'PDF generation failed');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        isGenerating: false,
        result: { success: false, error: errorMessage }
      }));
      
      addAnnouncement(`PDF generation failed: ${errorMessage}`);
      if (onError) onError(errorMessage);
      
      // Reset after 5 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, status: 'idle', progress: 0 }));
      }, 5000);
    }
  };

  const getStatusIcon = () => {
    switch (state.status) {
      case 'validating':
      case 'generating':
      case 'saving':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (state.status) {
      case 'validating':
        return 'Validating...';
      case 'generating':
        return 'Creating clean PDF...';
      case 'saving':
        return 'Saving file...';
      case 'success':
        return `Success! (${state.result?.pageCount} pages)`;
      case 'error':
        return 'Failed';
      default:
        return `Download PDF (${messages.length} messages)`;
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    button: `
      inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200
      bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      transform hover:scale-105 active:scale-95
    `,
    icon: `
      inline-flex items-center justify-center rounded-md p-2
      text-gray-600 hover:text-gray-800 hover:bg-gray-100
      dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700
      focus:outline-none focus:ring-2 focus:ring-blue-500
    `,
    text: `
      inline-flex items-center text-blue-600 hover:text-blue-700
      dark:text-blue-400 dark:hover:text-blue-300
      focus:outline-none focus:underline
    `
  };

  const baseClasses = `
    ${variantClasses[variant]}
    ${variant === 'button' ? sizeClasses[size] : ''}
    ${className}
  `;

  if (messages.length === 0) {
    return (
      <button
        disabled
        className={`${baseClasses} opacity-50 cursor-not-allowed`}
        title="No messages to export"
        aria-label="No messages available for PDF export"
      >
        <FileText className="w-4 h-4 mr-2" />
        No Messages
      </button>
    );
  }

  const estimation = pdfGenerationService.estimatePDFSize(messages);

  return (
    <div className="relative">
      <button
        onClick={handleGeneratePDF}
        disabled={state.isGenerating}
        className={baseClasses}
        title={`Generate clean PDF - Estimated: ${estimation.estimatedPages} pages, ${estimation.estimatedSize}`}
        aria-label={`Generate clean PDF of conversation with ${messages.length} messages`}
      >
        {getStatusIcon()}
        {variant !== 'icon' && (
          <span className="ml-2">
            {getStatusText()}
          </span>
        )}
      </button>

      {/* Progress Bar */}
      {state.isGenerating && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {getStatusText()}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {state.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Clean Options Panel */}
      {showOptions && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-10 min-w-80">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Clean PDF Options
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Page Format
              </label>
              <select
                value={pdfOptions.pageFormat || 'letter'}
                onChange={(e) => setPdfOptions(prev => ({ ...prev, pageFormat: e.target.value as any }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="a4">A4</option>
                <option value="letter">Letter</option>
                <option value="legal">Legal</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="include-timestamps"
                  checked={pdfOptions.includeTimestamps ?? true}
                  onChange={(e) => setPdfOptions(prev => ({ ...prev, includeTimestamps: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="include-timestamps" className="text-xs text-gray-700 dark:text-gray-300">
                  Include timestamps
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="include-footer"
                  checked={pdfOptions.includeFooter ?? false}
                  onChange={(e) => setPdfOptions(prev => ({ ...prev, includeFooter: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="include-footer" className="text-xs text-gray-700 dark:text-gray-300">
                  Include page numbers
                </label>
              </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
              ✨ Clean mode: No headers, metadata, or branding - just your conversation content
            </div>
          </div>

          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => setShowOptions(false)}
              className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowOptions(false)}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {state.status === 'error' && state.result?.error && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 z-10">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-sm text-red-700 dark:text-red-300">
              {state.result.error}
            </span>
          </div>
        </div>
      )}

      {/* Success Display */}
      {state.status === 'success' && state.result?.success && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              <span className="text-sm text-green-700 dark:text-green-300">
                Clean PDF saved successfully!
              </span>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              {state.result.pageCount} pages • {Math.round((state.result.size || 0) / 1024)}KB
            </div>
          </div>
        </div>
      )}

      {/* Options Toggle */}
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Clean PDF Options"
        aria-label="Configure clean PDF generation options"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
};

export default EnhancedPDFGenerator;