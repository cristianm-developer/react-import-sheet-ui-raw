import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { ViewPhaseContext } from './ViewPhaseContext.jsx';
import { useRawPagination } from './useRawPagination.js';

const mockSetPage = vi.fn();
const mockSetPageSize = vi.fn();

function createWrapper() {
  const value = {
    page: 1,
    setPage: mockSetPage,
    pageSize: 25,
    setPageSize: mockSetPageSize,
    totalRows: 100,
    filterMode: 'all' as const,
    setFilterMode: vi.fn(),
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

describe('useRawPagination', () => {
  it('returns page, pageSize, totalRows, setPage, setPageSize from context', () => {
    const { result } = renderHook(() => useRawPagination(), {
      wrapper: createWrapper(),
    });
    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(25);
    expect(result.current.totalRows).toBe(100);
    expect(typeof result.current.setPage).toBe('function');
    expect(typeof result.current.setPageSize).toBe('function');
  });

  it('setPage calls context setPage', () => {
    mockSetPage.mockClear();
    const { result } = renderHook(() => useRawPagination(), {
      wrapper: createWrapper(),
    });
    act(() => result.current.setPage(2));
    expect(mockSetPage).toHaveBeenCalledWith(2);
  });

  it('setPageSize calls context setPageSize', () => {
    mockSetPageSize.mockClear();
    const { result } = renderHook(() => useRawPagination(), {
      wrapper: createWrapper(),
    });
    act(() => result.current.setPageSize(50));
    expect(mockSetPageSize).toHaveBeenCalledWith(50);
  });

  it('throws when used outside RawViewPhaseProvider', () => {
    expect(() => renderHook(() => useRawPagination())).toThrow(
      'useRawPagination must be used within RawViewPhaseProvider'
    );
  });
});
