import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useRawImporterRoot } from './useRawImporterRoot';

const layout = { name: 'Test', version: '1', fields: { a: { name: 'a' } } };

describe('useRawImporterRoot', () => {
  it('returns providerProps with layout, engine, persist, persistKey', () => {
    const { result } = renderHook(() =>
      useRawImporterRoot({
        layout,
        engine: 'csv',
        persist: true,
        persistKey: 'my-key',
      })
    );
    expect(result.current.providerProps).toEqual({
      layout,
      engine: 'csv',
      persist: true,
      persistKey: 'my-key',
    });
  });

  it('returns default rootConfig when no options', () => {
    const { result } = renderHook(() => useRawImporterRoot());
    expect(result.current.rootConfig).toEqual({
      fuzzyMatch: true,
      editingEnabled: true,
      stages: {},
      autoApplyMappingWhenMismatchesAtMost: 'never',
      showErrorWhenMismatchesAbove: undefined,
    });
  });

  it('returns rootConfig with fuzzyMatch, editingEnabled, stages, mapping options', () => {
    const { result } = renderHook(() =>
      useRawImporterRoot({
        fuzzyMatch: false,
        editingEnabled: false,
        stages: { mapping: false, result: true },
        autoApplyMappingWhenMismatchesAtMost: 1,
        showErrorWhenMismatchesAbove: 5,
      })
    );
    expect(result.current.rootConfig).toEqual({
      fuzzyMatch: false,
      editingEnabled: false,
      stages: { mapping: false, result: true },
      autoApplyMappingWhenMismatchesAtMost: 1,
      showErrorWhenMismatchesAbove: 5,
    });
  });

  it('omits optional provider props when not passed', () => {
    const { result } = renderHook(() => useRawImporterRoot({ layout }));
    expect(result.current.providerProps).toEqual({
      layout,
      engine: undefined,
      persist: undefined,
      persistKey: undefined,
    });
  });
});
