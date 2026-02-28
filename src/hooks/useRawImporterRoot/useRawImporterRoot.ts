import { useMemo } from 'react';
import type { UseRawImporterRootOptions, UseRawImporterRootReturn } from './types.js';

const defaultStages = {};

export function useRawImporterRoot(
  options: UseRawImporterRootOptions = {}
): UseRawImporterRootReturn {
  const {
    layout,
    engine,
    persist,
    persistKey,
    fuzzyMatch = true,
    editingEnabled = true,
    stages = defaultStages,
    autoApplyMappingWhenMismatchesAtMost = 'never',
    showErrorWhenMismatchesAbove,
  } = options;

  const providerProps = useMemo(
    () => ({
      layout,
      engine,
      persist,
      persistKey,
    }),
    [layout, engine, persist, persistKey]
  );

  const rootConfig = useMemo(
    () => ({
      fuzzyMatch,
      editingEnabled,
      stages: { ...defaultStages, ...stages },
      autoApplyMappingWhenMismatchesAtMost,
      showErrorWhenMismatchesAbove,
    }),
    [
      fuzzyMatch,
      editingEnabled,
      stages,
      autoApplyMappingWhenMismatchesAtMost,
      showErrorWhenMismatchesAbove,
    ]
  );

  return { providerProps, rootConfig };
}
