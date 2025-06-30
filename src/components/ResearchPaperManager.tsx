import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { ResearchSummary } from '../types';

interface ResearchPaperManagerProps {
  onDownload: (query: string) => Promise<void>;
  onSummarize: (text: string) => Promise<ResearchSummary>;
}

const ResearchPaperManager: React.FC<ResearchPaperManagerProps> = ({
  onDownload,
  onSummarize,
}) => {
  const [activeTab, setActiveTab] = useState<'download' | 'summarize'>('download');
  const [query, setQuery] = useState('');
  const [paperText, setPaperText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === 'download') {
        await onDownload(query);
        setQuery('');
      } else {
        await onSummarize(paperText);
        setPaperText('');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setActiveTab('download')}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            activeTab === 'download'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Papers
        </button>
        <button
          onClick={() => setActiveTab('summarize')}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            activeTab === 'summarize'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          Summarize Paper
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === 'download' ? (
          <div>
            <label
              htmlFor="query"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Search Query
            </label>
            <input
              type="text"
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter research topic or keywords..."
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        ) : (
          <div>
            <label
              htmlFor="paperText"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Paper Text
            </label>
            <textarea
              id="paperText"
              value={paperText}
              onChange={(e) => setPaperText(e.target.value)}
              placeholder="Paste the paper text here..."
              rows={10}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (!query && !paperText)}
          className={`mt-4 px-6 py-2 rounded-md text-white transition-colors ${
            loading || (!query && !paperText)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : activeTab === 'download' ? (
            'Search Papers'
          ) : (
            'Generate Summary'
          )}
        </button>
      </form>
    </div>
  );
};

export default ResearchPaperManager;