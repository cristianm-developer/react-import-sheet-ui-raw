import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useSheetView } from '@cristianm/react-import-sheet-headless';
import type { FilterMode } from '../../shared/types/view-phase.js';
import { ViewPhaseContext, type ViewPhaseContextValue } from './ViewPhaseContext.jsx';

export interface RawViewPhaseProviderProps {
  children: ReactNode;
  /** Initial page (1-based). Default 1. */
  initialPage?: number;
  /** Initial page size. Default 25. */
  defaultPageSize?: number;
  /** Initial filter mode. Default 'all'. */
  defaultFilterMode?: FilterMode;
}

/**
 * Single source of truth for view phase: pagination, filter, export, persistence.
 * Must be used inside ImporterProvider (e.g. when status is success / RESULT view).
 * useRawPagination, useRawFilterToggle, useRawExport, useRawPersistence read from this context.
 */
export function RawViewPhaseProvider({
  children,
  initialPage = 1,
  defaultPageSize = 25,
  defaultFilterMode = 'all',
}: RawViewPhaseProviderProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>(defaultFilterMode);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const view = useSheetView({
    page: initialPage,
    defaultPageSize: pageSize,
    filterMode,
  });

  const value = useMemo<ViewPhaseContextValue>(
    () => ({
      page: view.page,
      setPage: view.setPage,
      pageSize: view.pageSize,
      setPageSize,
      totalRows: view.totalRows,
      filterMode,
      setFilterMode,
      downloadCSV: view.downloadCSV,
      downloadJSON: view.downloadJSON,
      hasRecoverableSession: view.hasRecoverableSession,
      recoverSession: view.recoverSession,
      clearSession: view.clearPersistedState,
    }),
    [
      view.page,
      view.setPage,
      view.pageSize,
      view.totalRows,
      view.downloadCSV,
      view.downloadJSON,
      view.hasRecoverableSession,
      view.recoverSession,
      view.clearPersistedState,
      filterMode,
      pageSize,
    ]
  );

  return <ViewPhaseContext.Provider value={value}>{children}</ViewPhaseContext.Provider>;
}
