import type { ConvertResult, ImporterStatus } from '@cristianm/react-import-sheet-headless';
import type { StatusView } from '../../shared/types/status-views.js';

export interface UseStatusViewReturn {
  view: StatusView;
  status: ImporterStatus;
  progressEventTarget: EventTarget;
  convertResult: ConvertResult | null;
}
