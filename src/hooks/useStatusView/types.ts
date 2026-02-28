import type { ConvertResult, ImporterStatus } from '@cristianm/react-import-sheet-headless';
import type { StatusView } from '../../shared/types/status-views.js';

/** Error shown when mismatch count exceeds showErrorWhenMismatchesAbove. */
export interface MappingErrorDetail {
  code: 'TOO_MANY_MISMATCHES';
  mismatchCount: number;
  maxAllowed: number;
}

export interface UseStatusViewReturn {
  view: StatusView;
  status: ImporterStatus;
  progressEventTarget: EventTarget;
  convertResult: ConvertResult | null;
  /** Set when view is 'error' due to too many mapping mismatches. */
  mappingErrorDetail: MappingErrorDetail | null;
}
