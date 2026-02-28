import { createContext, type ReactNode } from 'react';
import type { SheetLayout } from '@cristianm/react-import-sheet-headless';
import type { RootConfig } from './types.js';

const defaultConfig: RootConfig = {
  fuzzyMatch: true,
  editingEnabled: true,
  stages: {},
  autoApplyMappingWhenMismatchesAtMost: 'never',
  showErrorWhenMismatchesAbove: undefined,
};

export const RootConfigContext = createContext<RootConfig>(defaultConfig);

/** Layout from RawImporterRoot; used by useRawMappingTable/Row for field options. */
export const LayoutContext = createContext<SheetLayout | null>(null);

export interface RootConfigProviderProps {
  rootConfig: RootConfig;
  children: ReactNode;
}

export function RootConfigProvider({ rootConfig, children }: RootConfigProviderProps) {
  return <RootConfigContext.Provider value={rootConfig}>{children}</RootConfigContext.Provider>;
}

export interface LayoutProviderProps {
  layout: SheetLayout | null;
  children: ReactNode;
}

export function LayoutProvider({ layout, children }: LayoutProviderProps) {
  return <LayoutContext.Provider value={layout}>{children}</LayoutContext.Provider>;
}
