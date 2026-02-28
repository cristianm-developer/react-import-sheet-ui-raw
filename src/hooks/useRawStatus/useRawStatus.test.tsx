import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useRawStatus } from './useRawStatus';

vi.mock('@cristianm/react-import-sheet-headless', () => ({
  useImporterStatus: vi.fn(),
}));

const { useImporterStatus } = await import('@cristianm/react-import-sheet-headless');

describe('useRawStatus', () => {
  it('returns status from useImporterStatus', () => {
    vi.mocked(useImporterStatus).mockReturnValue({
      status: 'parsing',
      progressEventTarget: new EventTarget(),
    });
    const { result } = renderHook(() => useRawStatus());
    expect(result.current.status).toBe('parsing');
    expect(result.current.errorDetail).toBeUndefined();
  });

  it('returns errorDetail when status is error (shape ready for headless)', () => {
    vi.mocked(useImporterStatus).mockReturnValue({
      status: 'error',
      progressEventTarget: new EventTarget(),
    });
    const { result } = renderHook(() => useRawStatus());
    expect(result.current.status).toBe('error');
    expect('errorDetail' in result.current).toBe(true);
  });
});
