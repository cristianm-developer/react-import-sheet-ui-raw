import { forwardRef } from 'react';
import { useRawStatus } from '../../hooks/useRawStatus';
import type { RawStatusIndicatorProps } from './types.js';

export const RawStatusIndicator = forwardRef<HTMLDivElement, RawStatusIndicatorProps>(
  function RawStatusIndicator({ children, className, style }, ref) {
    const state = useRawStatus();
    return (
      <div ref={ref} className={className} style={style} data-ris-ui="raw-status-indicator">
        {children(state)}
      </div>
    );
  }
);
