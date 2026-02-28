import type { SheetLayout } from '@cristianm/react-import-sheet-headless';

export interface RootConfigStages {
  mapping?: boolean;
  process?: boolean;
  result?: boolean;
}

export interface RootConfig {
  fuzzyMatch: boolean;
  editingEnabled: boolean;
  stages: RootConfigStages;
}

export interface UseRawImporterRootOptions {
  layout?: SheetLayout | null;
  engine?: 'xlsx' | 'csv' | 'auto' | null;
  persist?: boolean;
  persistKey?: string;
  fuzzyMatch?: boolean;
  editingEnabled?: boolean;
  stages?: RootConfigStages;
}

export interface UseRawImporterRootReturn {
  providerProps: {
    layout?: SheetLayout | null;
    engine?: 'xlsx' | 'csv' | 'auto' | null;
    persist?: boolean;
    persistKey?: string;
  };
  rootConfig: RootConfig;
}
