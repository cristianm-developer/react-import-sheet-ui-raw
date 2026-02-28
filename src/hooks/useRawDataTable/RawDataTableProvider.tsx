import type { ReactNode } from 'react';
import { DataTableContext } from './DataTableContext.jsx';
import { useRawDataTable } from './useRawDataTable.js';
import type { UseRawDataTableOptions } from './useRawDataTable.js';

export interface RawDataTableProviderProps extends UseRawDataTableOptions {
  children: ReactNode;
}

/**
 * Provides DataTableContext (Roaming Tabindex, editingEnabled) for useRawTableBody/Row/Cell.
 * Must be used inside ImporterProvider + LayoutProvider + RootConfigProvider (e.g. RawImporterRoot).
 */
export function RawDataTableProvider({ children, onNavigateToIndex }: RawDataTableProviderProps) {
  const value = useRawDataTable({ onNavigateToIndex });
  return <DataTableContext.Provider value={value}>{children}</DataTableContext.Provider>;
}
