import { useContext } from 'react';
import { ViewPhaseContext } from './ViewPhaseContext.jsx';
import type { UseRawPaginationReturn } from './types.js';

const VIEW_PHASE_ERROR =
  'useRawPagination must be used within RawViewPhaseProvider (e.g. in RESULT view).';

export function useRawPagination(): UseRawPaginationReturn {
  const ctx = useContext(ViewPhaseContext);
  if (!ctx) throw new Error(VIEW_PHASE_ERROR);
  return {
    page: ctx.page,
    pageSize: ctx.pageSize,
    totalRows: ctx.totalRows,
    setPage: ctx.setPage,
    setPageSize: ctx.setPageSize,
  };
}
