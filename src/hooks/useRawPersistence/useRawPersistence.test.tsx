import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { ViewPhaseContext } from '../useRawPagination/ViewPhaseContext.jsx';
import { useRawPersistence } from './useRawPersistence.js';

const mockRecoverSession = vi.fn();
const mockClearSession = vi.fn();

function createWrapper(hasRecoverableSession: boolean) {
  const value = {
    page: 1,
    setPage: vi.fn(),
    pageSize: 25,
    setPageSize: vi.fn(),
    totalRows: 100,
    filterMode: 'all' as const,
    setFilterMode: vi.fn(),
    downloadCSV: vi.fn(),
    downloadJSON: vi.fn(),
    hasRecoverableSession,
    recoverSession: mockRecoverSession,
    clearSession: mockClearSession,
  };
  return function Wrapper({ children }: { children: ReactNode }) {
    return <ViewPhaseContext.Provider value={value}>{children}</ViewPhaseContext.Provider>;
  };
}

describe('useRawPersistence', () => {
  it('returns hasRecoverableSession false when no session', () => {
    const { result } = renderHook(() => useRawPersistence(), {
      wrapper: createWrapper(false),
    });
    expect(result.current.hasRecoverableSession).toBe(false);
  });

  it('returns hasRecoverableSession true when session exists', () => {
    const { result } = renderHook(() => useRawPersistence(), {
      wrapper: createWrapper(true),
    });
    expect(result.current.hasRecoverableSession).toBe(true);
  });

  it('recoverSession calls Core recoverSession', () => {
    mockRecoverSession.mockClear();
    const { result } = renderHook(() => useRawPersistence(), {
      wrapper: createWrapper(true),
    });
    act(() => {
      result.current.recoverSession();
    });
    expect(mockRecoverSession).toHaveBeenCalledTimes(1);
  });

  it('clearSession calls Core clearSession (clearPersistedState)', () => {
    mockClearSession.mockClear();
    const { result } = renderHook(() => useRawPersistence(), {
      wrapper: createWrapper(true),
    });
    act(() => {
      result.current.clearSession();
    });
    expect(mockClearSession).toHaveBeenCalledTimes(1);
  });

  it('throws when used outside RawViewPhaseProvider', () => {
    expect(() => renderHook(() => useRawPersistence())).toThrow(
      'useRawPersistence must be used within RawViewPhaseProvider'
    );
  });
});
