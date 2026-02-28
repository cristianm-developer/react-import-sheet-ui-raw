import { useContext } from 'react';
import { ViewPhaseContext } from '../useRawPagination/ViewPhaseContext.jsx';
import type { UseRawFilterToggleReturn } from './types.js';

const VIEW_PHASE_ERROR =
  'useRawFilterToggle must be used within RawViewPhaseProvider (e.g. in RESULT view).';

export function useRawFilterToggle(): UseRawFilterToggleReturn {
  const ctx = useContext(ViewPhaseContext);
  if (!ctx) throw new Error(VIEW_PHASE_ERROR);
  return {
    filterMode: ctx.filterMode,
    setFilterMode: ctx.setFilterMode,
  };
}
