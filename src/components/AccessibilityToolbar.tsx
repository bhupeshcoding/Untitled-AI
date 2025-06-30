import React, { useState } from 'react';
import { 
  Settings, 
  Eye, 
  Type, 
  Contrast, 
  Zap, 
  Focus,
  Volume2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAccessibility } from './AccessibilityProvider';

const AccessibilityToolbar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    highContrast,
    toggleHighContrast,
    reducedMotion,
    toggleReducedMotion,
    fontSize,
    setFontSize,
    focusMode,
    toggleFocusMode,
    addAnnouncement
  } = useAccessibility();

  const handleToggle = (action: () => void, announcement: string) => {
    action();
    addAnnouncement(announcement);
  };

  const fontSizeOptions = [
    { value: 'small', label: 'Small', size: '14px' },
    { value: 'medium', label: 'Medium', size: '16px' },
    { value: 'large', label: 'Large', size: '18px' },
    { value: 'extra-large', label: 'Extra Large', size: '20px' }
  ] as const;

  return (
    <div className="netlify-toolbar fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b-2 border-blue-600 shadow-lg">
      <div className="container mx-auto px-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
          aria-expanded={isExpanded}
          aria-controls="netlify-controls"
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} Netlify controls`}
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-600" aria-hidden="true" />
            <span className="font-semibold text-gray-900 dark:text-white">
              Netlify Controls
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
          )}
        </button>

        {isExpanded && (
          <div 
            id="netlify-controls"
            className="pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* High Contrast Toggle */}
            <div className="netlify-control">
              <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={() => handleToggle(
                    toggleHighContrast,
                    `High contrast mode ${highContrast ? 'disabled' : 'enabled'}`
                  )}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  highContrast 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {highContrast && <Contrast className="w-3 h-3" aria-hidden="true" />}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    High Contrast
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Enhance color contrast
                  </div>
                </div>
              </label>
            </div>

            {/* Font Size Control */}
            <div className="netlify-control">
              <label htmlFor="font-size-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Text Size
              </label>
              <select
                id="font-size-select"
                value={fontSize}
                onChange={(e) => {
                  const newSize = e.target.value as typeof fontSize;
                  setFontSize(newSize);
                  addAnnouncement(`Text size changed to ${newSize}`);
                }}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {fontSizeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.size})
                  </option>
                ))}
              </select>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="netlify-control">
              <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={() => handleToggle(
                    toggleReducedMotion,
                    `Reduced motion ${reducedMotion ? 'disabled' : 'enabled'}`
                  )}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  reducedMotion 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {reducedMotion && <Zap className="w-3 h-3" aria-hidden="true" />}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Reduce Motion
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Minimize animations
                  </div>
                </div>
              </label>
            </div>

            {/* Focus Mode Toggle */}
            <div className="netlify-control">
              <label className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={focusMode}
                  onChange={() => handleToggle(
                    toggleFocusMode,
                    `Focus mode ${focusMode ? 'disabled' : 'enabled'}`
                  )}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  focusMode 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {focusMode && <Focus className="w-3 h-3" aria-hidden="true" />}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Focus Mode
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Highlight interactive elements
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessibilityToolbar;