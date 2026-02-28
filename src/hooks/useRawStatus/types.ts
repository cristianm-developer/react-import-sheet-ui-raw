import type { ImporterStatus, SheetError } from '@cristianm/react-import-sheet-headless';

export interface UseRawStatusReturn {
  /** Current importer status from the Core. */
  status: ImporterStatus;
  /** Diagnostic object when status === 'error'. Aligned with headless SheetError (code, params, level, message). Undefined until headless exposes lastError. */
  errorDetail?: SheetError | null;
}
