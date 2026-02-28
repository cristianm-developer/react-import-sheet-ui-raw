import { createContext } from 'react';
import type { DataTableContextValue } from './types.js';

const defaultContext: DataTableContextValue = {
  editingEnabled: true,
  headerIds: [],
  totalRowCount: 0,
  focusedRowIndex: null,
  focusedCellKey: null,
  setFocused: () => {},
  pendingCell: null,
  setPendingCell: () => {},
  getKeyDownHandler: () => () => {},
};

export const DataTableContext = createContext<DataTableContextValue>(defaultContext);
