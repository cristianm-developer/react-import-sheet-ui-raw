import { forwardRef } from 'react';
import { useRawMappingRow } from '../../hooks/useRawMappingRow';
import type { RawMappingRowProps } from './types';

export const RawMappingRow = forwardRef<HTMLDivElement, RawMappingRowProps>(function RawMappingRow(
  { rowContext, children, className, style },
  ref
) {
  const state = useRawMappingRow({ rowContext });
  return (
    <div ref={ref} className={className} style={style} data-ris-ui="raw-mapping-row">
      {children(state)}
    </div>
  );
});
