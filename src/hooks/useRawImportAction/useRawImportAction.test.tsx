import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ImporterProvider } from '@cristianm/react-import-sheet-headless';
import { useRawImportAction } from './useRawImportAction';

const layout = { name: 'Test', version: '1', fields: { a: { name: 'A' } } };

function wrapper({ children }: { children: React.ReactNode }) {
  return <ImporterProvider layout={layout}>{children}</ImporterProvider>;
}

describe('useRawImportAction', () => {
  it('returns disabled and runImport', () => {
    const { result } = renderHook(() => useRawImportAction(), { wrapper });
    expect(typeof result.current.disabled).toBe('boolean');
    expect(result.current.disabled).toBe(true);
    expect(typeof result.current.runImport).toBe('function');
  });

  it('runImport is a function that can be called', () => {
    const { result } = renderHook(() => useRawImportAction(), { wrapper });
    expect(() => result.current.runImport()).not.toThrow();
  });
});
