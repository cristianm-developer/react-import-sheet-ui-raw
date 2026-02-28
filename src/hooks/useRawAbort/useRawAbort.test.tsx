import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useRawAbort } from './useRawAbort';

const mockAbort = vi.fn();
vi.mock('@cristianm/react-import-sheet-headless', () => ({
  useImporter: vi.fn(() => ({ abort: mockAbort })),
}));

describe('useRawAbort', () => {
  it('returns abort function from Core', () => {
    const { result } = renderHook(() => useRawAbort());
    expect(typeof result.current.abort).toBe('function');
  });

  it('abort calls Core abort', () => {
    mockAbort.mockClear();
    const { result } = renderHook(() => useRawAbort());
    result.current.abort();
    expect(mockAbort).toHaveBeenCalledTimes(1);
  });
});
