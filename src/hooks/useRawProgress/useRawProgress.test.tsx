import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  IMPORTER_PROGRESS_EVENT,
  IMPORTER_ABORTED_EVENT,
} from '@cristianm/react-import-sheet-headless';
import { useRawProgress } from './useRawProgress';

vi.mock('@cristianm/react-import-sheet-headless', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@cristianm/react-import-sheet-headless')>();
  return {
    ...actual,
    useImporterStatus: vi.fn(),
  };
});

const { useImporterStatus } = await import('@cristianm/react-import-sheet-headless');

describe('useRawProgress', () => {
  it('returns progressRef and subscribes to progressEventTarget', () => {
    const target = new EventTarget();
    vi.mocked(useImporterStatus).mockReturnValue({
      status: 'idle',
      progressEventTarget: target,
    });

    const { result } = renderHook(() => useRawProgress());
    expect(result.current.progressRef).toBeDefined();
    expect(result.current.progressRef.current).toBeNull();

    const detail = { phase: 'validate', globalPercent: 50 };
    target.dispatchEvent(new CustomEvent(IMPORTER_PROGRESS_EVENT, { detail }));
    expect(result.current.progressRef.current).toEqual(detail);

    target.dispatchEvent(new CustomEvent(IMPORTER_ABORTED_EVENT));
    expect(result.current.progressRef.current).toBeNull();
  });

  it('calls onProgress when provided and event fires', () => {
    const target = new EventTarget();
    vi.mocked(useImporterStatus).mockReturnValue({
      status: 'idle',
      progressEventTarget: target,
    });
    const onProgress = vi.fn();

    const { result } = renderHook(() => useRawProgress({ onProgress }));
    const detail = { globalPercent: 75 };
    target.dispatchEvent(new CustomEvent(IMPORTER_PROGRESS_EVENT, { detail }));

    expect(onProgress).toHaveBeenCalledWith(detail);
    expect(result.current.progressRef.current).toEqual(detail);
  });

  it('unsubscribes on unmount', () => {
    const target = new EventTarget();
    vi.mocked(useImporterStatus).mockReturnValue({
      status: 'idle',
      progressEventTarget: target,
    });
    const addSpy = vi.spyOn(target, 'addEventListener');
    const removeSpy = vi.spyOn(target, 'removeEventListener');

    const { unmount } = renderHook(() => useRawProgress());
    expect(addSpy).toHaveBeenCalledWith(IMPORTER_PROGRESS_EVENT, expect.any(Function));
    unmount();
    expect(removeSpy).toHaveBeenCalledWith(IMPORTER_PROGRESS_EVENT, expect.any(Function));
  });
});
