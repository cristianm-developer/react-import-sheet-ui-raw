import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LayoutContext } from '../useRawImporterRoot/RootConfigContext.jsx';
import { useRawTableHead } from './useRawTableHead.js';

function wrapper({ children }: { children: React.ReactNode }) {
  const layout = {
    name: 'Test',
    version: 1,
    fields: {
      colA: { name: 'Column A' },
      colB: { name: 'Column B' },
    },
  } as never;
  return <LayoutContext.Provider value={layout}>{children}</LayoutContext.Provider>;
}

describe('useRawTableHead', () => {
  it('returns headers from layout (id, label)', () => {
    const { result } = renderHook(() => useRawTableHead(), { wrapper });
    expect(result.current.headers).toHaveLength(2);
    expect(result.current.headers[0]).toEqual({ id: 'colA', label: 'Column A' });
    expect(result.current.headers[1]).toEqual({ id: 'colB', label: 'Column B' });
  });

  it('returns empty headers when layout is null', () => {
    const nullWrapper = ({ children }: { children: React.ReactNode }) => (
      <LayoutContext.Provider value={null}>{children}</LayoutContext.Provider>
    );
    const { result } = renderHook(() => useRawTableHead(), { wrapper: nullWrapper });
    expect(result.current.headers).toEqual([]);
  });
});
