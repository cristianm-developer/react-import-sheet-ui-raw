import { useEffect, useRef } from 'react';
import {
  useImporterStatus,
  IMPORTER_PROGRESS_EVENT,
  IMPORTER_ABORTED_EVENT,
} from '@cristianm/react-import-sheet-headless';
import type { ImporterProgressDetail } from '@cristianm/react-import-sheet-headless';
import type { UseRawProgressOptions, UseRawProgressReturn } from './types.js';

export function useRawProgress(options: UseRawProgressOptions = {}): UseRawProgressReturn {
  const { onProgress } = options;
  const { progressEventTarget } = useImporterStatus();
  const progressRef = useRef<ImporterProgressDetail | null>(null);

  useEffect(() => {
    const target = progressEventTarget;
    const handleProgress = (e: Event) => {
      const detail = (e as CustomEvent<ImporterProgressDetail>).detail;
      progressRef.current = detail ?? null;
      onProgress?.(detail);
    };
    const handleAborted = () => {
      progressRef.current = null;
    };
    target.addEventListener(IMPORTER_PROGRESS_EVENT, handleProgress);
    target.addEventListener(IMPORTER_ABORTED_EVENT, handleAborted);
    return () => {
      target.removeEventListener(IMPORTER_PROGRESS_EVENT, handleProgress);
      target.removeEventListener(IMPORTER_ABORTED_EVENT, handleAborted);
    };
  }, [progressEventTarget, onProgress]);

  return {
    progressRef,
    ...(onProgress ? { onProgress } : {}),
  };
}
