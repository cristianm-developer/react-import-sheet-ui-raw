import { forwardRef } from 'react';
import { useRawProgress } from '../../hooks/useRawProgress';
import type { RawProgressDisplayProps } from './types.js';

export const RawProgressDisplay = forwardRef<HTMLDivElement, RawProgressDisplayProps>(
  function RawProgressDisplay({ children, className, style, onProgress }, ref) {
    const state = useRawProgress({ onProgress });
    return (
      <div ref={ref} className={className} style={style} data-ris-ui="raw-progress-display">
        {children(state)}
      </div>
    );
  }
);
