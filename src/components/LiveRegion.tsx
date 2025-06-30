import React, { useEffect, useRef } from 'react';
import { useAccessibility } from './AccessibilityProvider';

interface LiveRegionProps {
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
}

const LiveRegion: React.FC<LiveRegionProps> = ({
  politeness = 'polite',
  atomic = true,
  relevant = 'additions text',
  className = ''
}) => {
  const { announcements } = useAccessibility();
  const regionRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={regionRef}
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={`sr-only ${className}`}
      role="status"
    >
      {announcements.map((announcement, index) => (
        <div key={index}>{announcement}</div>
      ))}
    </div>
  );
};

export default LiveRegion;