import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
  useImporterStatus,
  IMPORTER_PROGRESS_EVENT,
  IMPORTER_ABORTED_EVENT,
  type ImporterProgressDetail,
} from '@cristianm/react-import-sheet-headless';

export interface RawProgressMonitorProps {
  /** Optional class name for the root element. */
  className?: string;
  /** Optional inline styles for the root element. */
  style?: React.CSSProperties;
  /**
   * Render prop to paint progress bar and phase. Receives the current phase (from last progress event)
   * and a ref that is updated on every progress event (no re-renders). Read progressRef.current
   * for the latest ImporterProgressDetail (globalPercent, localPercent, etc.).
   */
  children?: (args: {
    phase: string;
    progressRef: React.RefObject<ImporterProgressDetail | null>;
    aborted: boolean;
  }) => React.ReactNode;
  /**
   * Optional callback invoked on each progress event. Use this to drive your own state (e.g. setState)
   * and re-render a progress bar; RawProgressMonitor itself does not re-render on every %.
   */
  onProgress?: (detail: ImporterProgressDetail) => void;
}

const RawProgressMonitorInner = (
  props: RawProgressMonitorProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) => {
  const { className, style, children, onProgress } = props;

  const { progressEventTarget } = useImporterStatus();
  const progressRef = useRef<ImporterProgressDetail | null>(null);
  const [phase, setPhase] = useState<string>('');
  const [aborted, setAborted] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ImporterProgressDetail>).detail;
      progressRef.current = detail ?? null;
      if (detail?.phase != null) {
        setPhase(detail.phase);
      }
      onProgress?.(detail);
    };
    const abortHandler = () => {
      setAborted(true);
    };

    progressEventTarget.addEventListener(IMPORTER_PROGRESS_EVENT, handler);
    progressEventTarget.addEventListener(IMPORTER_ABORTED_EVENT, abortHandler);

    return () => {
      progressEventTarget.removeEventListener(IMPORTER_PROGRESS_EVENT, handler);
      progressEventTarget.removeEventListener(IMPORTER_ABORTED_EVENT, abortHandler);
    };
  }, [progressEventTarget, onProgress]);

  const content =
    typeof children === 'function'
      ? children({ phase, progressRef, aborted })
      : null;

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      data-ris-ui="raw-progress-monitor"
    >
      {content}
    </div>
  );
};

export const RawProgressMonitor = forwardRef<
  HTMLDivElement,
  RawProgressMonitorProps
>(RawProgressMonitorInner);

RawProgressMonitor.displayName = 'RawProgressMonitor';
