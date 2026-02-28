import { forwardRef, type ReactNode } from 'react';
import { useStatusView } from '../../hooks/useStatusView';
import type { RawStatusGuardProps } from './types';

export const RawStatusGuard = forwardRef<HTMLDivElement, RawStatusGuardProps>(
  function RawStatusGuard(
    { renderIdle, renderMapping, renderProcess, renderResult, renderError, className, style },
    ref
  ) {
    const data = useStatusView();
    const { view } = data;

    let content: ReactNode = null;
    if (view === 'idle' && renderIdle) content = renderIdle(data);
    else if (view === 'mapping' && renderMapping) content = renderMapping(data);
    else if (view === 'process' && renderProcess) content = renderProcess(data);
    else if (view === 'result' && renderResult) content = renderResult(data);
    else if (view === 'error' && renderError) content = renderError(data);

    return (
      <div ref={ref} className={className} style={style} data-ris-ui="raw-status-guard">
        {content}
      </div>
    );
  }
);
