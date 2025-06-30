import React from 'react';
import { ResearchSummary as ResearchSummaryType } from '../types';

interface ResearchSummaryProps {
  summary: ResearchSummaryType;
}

const ResearchSummary: React.FC<ResearchSummaryProps> = ({ summary }) => {
  return (
    <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Research Summary</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Problem</h4>
          <p className="text-gray-800 dark:text-gray-200">{summary.problem}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Method</h4>
          <p className="text-gray-800 dark:text-gray-200">{summary.method}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Key Findings</h4>
          <p className="text-gray-800 dark:text-gray-200">{summary.findings}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Practical Application</h4>
          <p className="text-gray-800 dark:text-gray-200">{summary.application}</p>
        </div>
      </div>
    </div>
  );
};

export default ResearchSummary;