import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { ViewPhaseContext } from '../useRawPagination/ViewPhaseContext.jsx';
import { useRawExport } from './useRawExport.js';

const mockDownloadCSV = vi.fn();
const mockDownloadJSON = vi.fn();

function createWrapper() {
  const value = {
    page: 1,
    setPage: vi.fn(),
    pageSize: 25,
    setPageSize: vi.fn(),
    totalRows: 100,
    filterMode: 'all' as const,
    setFilterMode: vi.fn(),
    downloadCSV: mockDownloadCSV,
    downloadJSON: mockDownloadJSON,
    hasRecoverableSession: false,
    recoverSession: vi.fn(),
    clearSession: vi.fn(),
  };
  return function Wrapper({ children }: { children: ReactNode }) {
    return <ViewPhaseContext.Provider value={value}>{children}</ViewPhaseContext.Provider>;
  };
}

describe('useRawExport', () => {
  it('returns downloadCSV and downloadJSON from context', () => {
    const { result } = renderHook(() => useRawExport(), {
      wrapper: createWrapper(),
    });
    expect(typeof result.current.downloadCSV).toBe('function');
    expect(typeof result.current.downloadJSON).toBe('function');
  });

  it('downloadCSV calls Core downloadCSV', () => {
    mockDownloadCSV.mockClear();
    const { result } = renderHook(() => useRawExport(), {
      wrapper: createWrapper(),
    });
    result.current.downloadCSV({ filename: 'test' });
    expect(mockDownloadCSV).toHaveBeenCalledWith({ filename: 'test' });
  });

  it('downloadJSON calls Core downloadJSON', () => {
    mockDownloadJSON.mockClear();
    const { result } = renderHook(() => useRawExport(), {
      wrapper: createWrapper(),
    });
    result.current.downloadJSON();
    expect(mockDownloadJSON).toHaveBeenCalledWith();
  });

  it('throws when used outside RawViewPhaseProvider', () => {
    expect(() => renderHook(() => useRawExport())).toThrow(
      'useRawExport must be used within RawViewPhaseProvider'
    );
  });
});
