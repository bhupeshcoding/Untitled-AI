import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Share2,
  Copy,
  Linkedin,
  Star,
  TrendingUp
} from 'lucide-react';
import { linkedinPDFService, LinkedInPDFOptions, LinkedInPDFResult } from '../services/linkedinPDFService';
import { ChatMessage } from '../services/geminiChat';
import { useAccessibility } from './AccessibilityProvider';
import CopyButton from './CopyButton';

interface LinkedInPDFGeneratorProps {
  messages: ChatMessage[];
  title?: string;
  filename?: string;
  className?: string;
  variant?: 'button' | 'icon' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  options?: Partial<LinkedInPDFOptions>;
  onSuccess?: (filename: string, shareableText: string) => void;
  onError?: (error: string) => void;
}

interface GenerationState {
  isGenerating: boolean;
  progress: number;
  status: 'idle' | 'validating' | 'generating' | 'formatting' | 'finalizing' | 'success' | 'error';
  result?: LinkedInPDFResult;
}

const LinkedInPDFGenerator: React.FC<LinkedInPDFGeneratorProps> = ({
  messages,
  title = 'AI-Powered Insights',
  filename,
  className = '',
  variant = 'premium',
  size = 'md',
  options = {},
  onSuccess,
  onError
}) => {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    status: 'idle'
  });
  const [showOptions, setShowOptions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [pdfOptions, setPdfOptions] = useState<Partial<LinkedInPDFOptions>>({
    pageFormat: 'a4',
    includeHeader: true,
    includeFooter: true,
    includeTimestamps: true,
    brandingStyle: 'professional',
    colorScheme: 'blue',
    includeStats: true,
    linkedinHandle: '',
    ...options
  });

  const { addAnnouncement } = useAccessibility();

  const handleGenerateLinkedInPDF = async () => {
    // Validate messages
    if (!messages || messages.length === 0) {
      const error = 'No conversation content to generate PDF';
      setState(prev => ({ ...prev, status: 'error', result: { success: false, error } }));
      addAnnouncement(`PDF generation failed: ${error}`);
      if (onError) onError(error);
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true, status: 'validating', progress: 5 }));
    addAnnouncement('Starting LinkedIn-ready PDF generation...');

    try {
      // Progress updates with realistic timing
      setState(prev => ({ ...prev, status: 'generating', progress: 20 }));
      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => ({ ...prev, status: 'formatting', progress: 50 }));
      await new Promise(resolve => setTimeout(resolve, 800));

      setState(prev => ({ ...prev, progress: 75 }));
      
      // Generate LinkedIn-ready PDF
      const result = await linkedinPDFService.generateLinkedInPDF(
        messages,
        title,
        filename,
        pdfOptions
      );

      setState(prev => ({ ...prev, status: 'finalizing', progress: 95 }));
      await new Promise(resolve => setTimeout(resolve, 300));

      if (result.success) {
        setState(prev => ({ 
          ...prev, 
          status: 'success', 
          progress: 100, 
          result,
          isGenerating: false 
        }));
        
        addAnnouncement(`LinkedIn-ready PDF generated successfully: ${result.filename}`);
        if (onSuccess) onSuccess(result.filename!, result.shareableText!);
        
        // Show share modal
        setShowShareModal(true);
        
        // Reset after 5 seconds
        setTimeout(() => {
          setState(prev => ({ ...prev, status: 'idle', progress: 0 }));
        }, 5000);
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
      
      addAnnouncement(`LinkedIn PDF generation failed: ${errorMessage}`);
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
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'generating':
        return <Loader2 className="w-4 h-4 animate-spin text-purple-500" />;
      case 'formatting':
        return <Loader2 className="w-4 h-4 animate-spin text-green-500" />;
      case 'finalizing':
        return <Loader2 className="w-4 h-4 animate-spin text-orange-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Linkedin className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (state.status) {
      case 'validating':
        return 'Validating content...';
      case 'generating':
        return 'Creating professional layout...';
      case 'formatting':
        return 'Adding LinkedIn-ready formatting...';
      case 'finalizing':
        return 'Finalizing document...';
      case 'success':
        return `LinkedIn-Ready! (${state.result?.pageCount} pages)`;
      case 'error':
        return 'Generation failed';
      default:
        return `Generate LinkedIn PDF (${messages.length} insights)`;
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
    premium: `
      inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200
      bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800
      text-white shadow-xl hover:shadow-2xl
      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      transform hover:scale-105 active:scale-95
      border border-purple-300
    `
  };

  const baseClasses = `
    ${variantClasses[variant]}
    ${variant !== 'icon' ? sizeClasses[size] : ''}
    ${className}
  `;

  if (messages.length === 0) {
    return (
      <button
        disabled
        className={`${baseClasses} opacity-50 cursor-not-allowed`}
        title="No conversation content available"
        aria-label="No conversation content available for LinkedIn PDF"
      >
        <FileText className="w-4 h-4 mr-2" />
        No Content
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleGenerateLinkedInPDF}
        disabled={state.isGenerating}
        className={baseClasses}
        title="Generate LinkedIn-ready PDF with professional formatting"
        aria-label={`Generate LinkedIn-ready PDF with ${messages.length} conversation insights`}
      >
        {getStatusIcon()}
        {variant !== 'icon' && (
          <span className="ml-2">
            {getStatusText()}
          </span>
        )}
        {variant === 'premium' && !state.isGenerating && (
          <Star className="w-4 h-4 ml-2 text-yellow-300" />
        )}
      </button>

      {/* Enhanced Progress Bar */}
      {state.isGenerating && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-10 min-w-80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {getStatusText()}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {state.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${state.progress}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Creating professional LinkedIn-ready document with margins, headings, and insights...
          </div>
        </div>
      )}

      {/* LinkedIn Options Panel */}
      {showOptions && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 z-10 min-w-96">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Linkedin className="w-5 h-5 mr-2 text-blue-600" />
            LinkedIn PDF Options
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Page Format
                </label>
                <select
                  value={pdfOptions.pageFormat || 'a4'}
                  onChange={(e) => setPdfOptions(prev => ({ ...prev, pageFormat: e.target.value as any }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="a4">A4 (Professional)</option>
                  <option value="letter">Letter (US Standard)</option>
                  <option value="legal">Legal (Extended)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color Scheme
                </label>
                <select
                  value={pdfOptions.colorScheme || 'blue'}
                  onChange={(e) => setPdfOptions(prev => ({ ...prev, colorScheme: e.target.value as any }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="blue">LinkedIn Blue</option>
                  <option value="purple">Professional Purple</option>
                  <option value="green">Success Green</option>
                  <option value="orange">Creative Orange</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                LinkedIn Handle (Optional)
              </label>
              <input
                type="text"
                placeholder="@yourhandle"
                value={pdfOptions.linkedinHandle || ''}
                onChange={(e) => setPdfOptions(prev => ({ ...prev, linkedinHandle: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="include-stats"
                  checked={pdfOptions.includeStats ?? true}
                  onChange={(e) => setPdfOptions(prev => ({ ...prev, includeStats: e.target.checked }))}
                  className="mr-3"
                />
                <label htmlFor="include-stats" className="text-sm text-gray-700 dark:text-gray-300">
                  Include conversation statistics and insights
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="include-timestamps"
                  checked={pdfOptions.includeTimestamps ?? true}
                  onChange={(e) => setPdfOptions(prev => ({ ...prev, includeTimestamps: e.target.checked }))}
                  className="mr-3"
                />
                <label htmlFor="include-timestamps" className="text-sm text-gray-700 dark:text-gray-300">
                  Include timestamps for professional tracking
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="include-footer"
                  checked={pdfOptions.includeFooter ?? true}
                  onChange={(e) => setPdfOptions(prev => ({ ...prev, includeFooter: e.target.checked }))}
                  className="mr-3"
                />
                <label htmlFor="include-footer" className="text-sm text-gray-700 dark:text-gray-300">
                  Include professional footer with branding
                </label>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  LinkedIn-Ready Features
                </span>
              </div>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Professional margins and padding</li>
                <li>• Executive summary with key metrics</li>
                <li>• Structured headings and sections</li>
                <li>• Conversation insights and takeaways</li>
                <li>• Shareable content formatting</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-3">
            <button
              onClick={() => setShowOptions(false)}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowOptions(false)}
              className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700"
            >
              Apply Settings
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && state.result?.success && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Share2 className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  LinkedIn-Ready Content
                </h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="font-medium text-green-800 dark:text-green-300">
                    PDF Generated Successfully!
                  </span>
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  {state.result.pageCount} pages • {Math.round((state.result.size || 0) / 1024)}KB • Professional formatting
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Ready-to-post LinkedIn content:
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                    {state.result.shareableText}
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <CopyButton
                    text={state.result.shareableText || ''}
                    label="Copy LinkedIn post"
                    showText
                    successMessage="LinkedIn post copied!"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                  🚀 Pro Tips for Maximum LinkedIn Engagement:
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Post during peak hours (8-10 AM, 12-2 PM, 5-6 PM)</li>
                  <li>• Add relevant hashtags for your industry</li>
                  <li>• Tag colleagues or connections who might find this valuable</li>
                  <li>• Include a call-to-action asking for thoughts or experiences</li>
                  <li>• Share the PDF as a document attachment for maximum reach</li>
                </ul>
              </div>
            </div>
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

      {/* Options Toggle */}
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="ml-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="LinkedIn PDF Options"
        aria-label="Configure LinkedIn PDF generation options"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
};

export default LinkedInPDFGenerator;