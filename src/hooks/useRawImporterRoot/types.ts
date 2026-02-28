import type { SheetLayout } from '@cristianm/react-import-sheet-headless';

export interface RootConfigStages {
  mapping?: boolean;
  process?: boolean;
  result?: boolean;
}

/**
 * When to auto-apply mapping (skip mapping UI):
 * - `'never'`: always show mapping when convertResult exists (default).
 * - `0`: auto-apply when 0 mismatches; show mapping when ≥1.
 * - `1`: auto-apply when 0 or 1 mismatches; show mapping when ≥2.
 * - `N`: auto-apply when mismatches ≤ N; show mapping when > N.
 */
export type AutoApplyMappingWhenMismatchesAtMost = number | 'never';

export interface RootConfig {
  fuzzyMatch: boolean;
  editingEnabled: boolean;
  stages: RootConfigStages;
  /** When to skip mapping UI and auto-apply. Default 'never'. */
  autoApplyMappingWhenMismatchesAtMost: AutoApplyMappingWhenMismatchesAtMost;
  /** When set, show error view instead of mapping when mismatch count > this. */
  showErrorWhenMismatchesAbove: number | undefined;
}

export interface UseRawImporterRootOptions {
  layout?: SheetLayout | null;
  engine?: 'xlsx' | 'csv' | 'auto' | null;
  persist?: boolean;
  persistKey?: string;
  fuzzyMatch?: boolean;
  editingEnabled?: boolean;
  stages?: RootConfigStages;
  /** Auto-apply mapping when mismatches ≤ this; 'never' = always show mapping. Default 'never'. */
  autoApplyMappingWhenMismatchesAtMost?: AutoApplyMappingWhenMismatchesAtMost;
  /** Show error instead of mapping when mismatches > this. Optional. */
  showErrorWhenMismatchesAbove?: number;
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
