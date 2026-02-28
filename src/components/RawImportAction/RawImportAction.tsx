import { forwardRef } from 'react';
import { useRawImportAction } from '../../hooks/useRawImportAction';
import type { RawImportActionProps } from './types';

export const RawImportAction = forwardRef<HTMLDivElement, RawImportActionProps>(
  function RawImportAction({ children, className, style }, ref) {
    const state = useRawImportAction();
    return (
      <div ref={ref} className={className} style={style} data-ris-ui="raw-import-action">
        {children(state)}
      </div>
    );
  }
);
