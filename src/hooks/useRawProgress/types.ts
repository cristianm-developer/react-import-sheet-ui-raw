import type { ImporterProgressDetail } from '@cristianm/react-import-sheet-headless';
import type { RefObject } from 'react';

export interface UseRawProgressOptions {
  /** Called on each importer-progress event if the consumer wants to drive state (e.g. setPercent). Optional; for high perf use progressRef only. */
  onProgress?: (detail: ImporterProgressDetail) => void;
}

export interface UseRawProgressReturn {
  /** Ref updated on each importer-progress event; no re-renders. Read in requestAnimationFrame or from a display component. */
  progressRef: RefObject<ImporterProgressDetail | null>;
  /** Only present if passed in options; same callback. */
  onProgress?: (detail: ImporterProgressDetail) => void;
}
