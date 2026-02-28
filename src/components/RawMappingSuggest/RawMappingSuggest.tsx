import { forwardRef } from 'react';
import { useRawMappingSuggest } from '../../hooks/useRawMappingSuggest';
import type { RawMappingSuggestProps } from './types';

export const RawMappingSuggest = forwardRef<HTMLDivElement, RawMappingSuggestProps>(
  function RawMappingSuggest({ columnContext, children, className, style }, ref) {
    const state = useRawMappingSuggest({ columnContext });
    return (
      <div ref={ref} className={className} style={style} data-ris-ui="raw-mapping-suggest">
        {children(state)}
      </div>
    );
  }
);
