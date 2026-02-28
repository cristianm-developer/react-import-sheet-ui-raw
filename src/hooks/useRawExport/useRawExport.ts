import { useContext } from 'react';
import { ViewPhaseContext } from '../useRawPagination/ViewPhaseContext.jsx';
import type { UseRawExportReturn } from './types.js';

const VIEW_PHASE_ERROR =
  'useRawExport must be used within RawViewPhaseProvider (e.g. in RESULT view).';

export function useRawExport(): UseRawExportReturn {
  const ctx = useContext(ViewPhaseContext);
  if (!ctx) throw new Error(VIEW_PHASE_ERROR);
  return {
    downloadCSV: ctx.downloadCSV,
    downloadJSON: ctx.downloadJSON,
  };
}
