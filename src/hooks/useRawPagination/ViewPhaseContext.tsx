import { createContext } from 'react';
import type { FilterMode } from '../../shared/types/view-phase.js';

export interface ViewPhaseContextValue {
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalRows: number;
  filterMode: FilterMode;
  setFilterMode: (mode: FilterMode) => void;
  downloadCSV: (opts?: { filename?: string }) => void | Promise<void>;
  downloadJSON: (opts?: { filename?: string }) => void | Promise<void>;
  hasRecoverableSession: boolean;
  recoverSession: () => Promise<void>;
  clearSession: () => Promise<void>;
}

export const ViewPhaseContext = createContext<ViewPhaseContextValue | null>(null);
