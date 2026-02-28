import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { ViewPhaseContext } from '../useRawPagination/ViewPhaseContext.jsx';
import { useRawFilterToggle } from './useRawFilterToggle.js';

const mockSetFilterMode = vi.fn();

function createWrapper(filterMode: 'all' | 'errors-only' = 'all') {
  const value = {
    page: 1,
    setPage: vi.fn(),
    pageSize: 25,
    setPageSize: vi.fn(),
    totalRows: 10,
    filterMode,
    setFilterMode: mockSetFilterMode,
    downloadCSV: vi.fn(),
    downloadJSON: vi.fn(),
    hasRecoverableSession: false,
    recoverSession: vi.fn(),
    clearSession: vi.fn(),
  };
  return function Wrapper({ children }: { children: ReactNode }) {
    return <ViewPhaseContext.Provider value={value}>{children}</ViewPhaseContext.Provider>;
  };
}

describe('useRawFilterToggle', () => {
  it('returns filterMode and setFilterMode from context', () => {
    const { result } = renderHook(() => useRawFilterToggle(), {
      wrapper: createWrapper('all'),
    });
    expect(result.current.filterMode).toBe('all');
    expect(typeof result.current.setFilterMode).toBe('function');
  });

  it('returns errors-only when context has filterMode errors-only', () => {
    const { result } = renderHook(() => useRawFilterToggle(), {
      wrapper: createWrapper('errors-only'),
    });
    expect(result.current.filterMode).toBe('errors-only');
  });

  it('setFilterMode calls context setFilterMode', () => {
    mockSetFilterMode.mockClear();
    const { result } = renderHook(() => useRawFilterToggle(), {
      wrapper: createWrapper(),
    });
    act(() => result.current.setFilterMode('errors-only'));
    expect(mockSetFilterMode).toHaveBeenCalledWith('errors-only');
  });

  it('throws when used outside RawViewPhaseProvider', () => {
    expect(() => renderHook(() => useRawFilterToggle())).toThrow(
      'useRawFilterToggle must be used within RawViewPhaseProvider'
    );
  });
});
