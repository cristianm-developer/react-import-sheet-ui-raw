import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RootConfigProvider } from '../useRawImporterRoot/RootConfigContext';
import { useStatusView } from './useStatusView';

vi.mock('@cristianm/react-import-sheet-headless', () => ({
  useImporterStatus: vi.fn(),
  useConvert: vi.fn(),
}));

const { useImporterStatus, useConvert } = await import('@cristianm/react-import-sheet-headless');

function wrapper({
  children,
  stages,
  autoApplyMappingWhenMismatchesAtMost = 'never' as const,
  showErrorWhenMismatchesAbove,
}: {
  children: React.ReactNode;
  stages?: { mapping?: boolean; process?: boolean; result?: boolean };
  autoApplyMappingWhenMismatchesAtMost?: number | 'never';
  showErrorWhenMismatchesAbove?: number;
}) {
  return (
    <RootConfigProvider
      rootConfig={{
        fuzzyMatch: true,
        editingEnabled: true,
        stages: stages ?? {},
        autoApplyMappingWhenMismatchesAtMost,
        showErrorWhenMismatchesAbove,
      }}
    >
      {children}
    </RootConfigProvider>
  );
}

describe('useStatusView', () => {
  it('returns mapping when convertResult is not null', () => {
    vi.mocked(useImporterStatus).mockReturnValue({
      status: 'idle',
      progressEventTarget: new EventTarget(),
    });
    vi.mocked(useConvert).mockReturnValue({
      convert: vi.fn(),
      convertedSheet: null,
      convertResult: {
        kind: 'mismatch',
        headersFound: [],
        mismatches: [],
        columnOrder: [],
        headerToFieldMap: {},
      },
    } as ReturnType<typeof useConvert>);
    const { result } = renderHook(() => useStatusView(), {
      wrapper: ({ children }) => wrapper({ children }),
    });
    expect(result.current.view).toBe('mapping');
    expect(result.current.convertResult).not.toBeNull();
  });

  it('returns idle when status is idle and convertResult is null', () => {
    vi.mocked(useImporterStatus).mockReturnValue({
      status: 'idle',
      progressEventTarget: new EventTarget(),
    });
    vi.mocked(useConvert).mockReturnValue({
      convert: vi.fn(),
      convertedSheet: null,
      convertResult: null,
    } as ReturnType<typeof useConvert>);
    const { result } = renderHook(() => useStatusView(), {
      wrapper: ({ children }) => wrapper({ children }),
    });
    expect(result.current.view).toBe('idle');
  });

  it('returns process when status is validating', () => {
    vi.mocked(useImporterStatus).mockReturnValue({
      status: 'validating',
      progressEventTarget: new EventTarget(),
    });
    vi.mocked(useConvert).mockReturnValue({
      convert: vi.fn(),
      convertedSheet: null,
      convertResult: null,
    } as ReturnType<typeof useConvert>);
    const { result } = renderHook(() => useStatusView(), {
      wrapper: ({ children }) => wrapper({ children }),
    });
    expect(result.current.view).toBe('process');
  });

  it('returns result when status is success', () => {
    vi.mocked(useImporterStatus).mockReturnValue({
      status: 'success',
      progressEventTarget: new EventTarget(),
    });
    vi.mocked(useConvert).mockReturnValue({
      convert: vi.fn(),
      convertedSheet: null,
      convertResult: null,
    } as ReturnType<typeof useConvert>);
    const { result } = renderHook(() => useStatusView(), {
      wrapper: ({ children }) => wrapper({ children }),
    });
    expect(result.current.view).toBe('result');
  });

  it('returns error when status is error', () => {
    vi.mocked(useImporterStatus).mockReturnValue({
      status: 'error',
      progressEventTarget: new EventTarget(),
    });
    vi.mocked(useConvert).mockReturnValue({
      convert: vi.fn(),
      convertedSheet: null,
      convertResult: null,
    } as ReturnType<typeof useConvert>);
    const { result } = renderHook(() => useStatusView(), {
      wrapper: ({ children }) => wrapper({ children }),
    });
    expect(result.current.view).toBe('error');
  });

  it('respects stages.mapping false and returns idle instead of mapping', () => {
    vi.mocked(useImporterStatus).mockReturnValue({
      status: 'idle',
      progressEventTarget: new EventTarget(),
    });
    vi.mocked(useConvert).mockReturnValue({
      convert: vi.fn(),
      convertedSheet: null,
      convertResult: {
        kind: 'mismatch',
        headersFound: [],
        mismatches: [],
        columnOrder: [],
        headerToFieldMap: {},
      },
    } as ReturnType<typeof useConvert>);
    const { result } = renderHook(() => useStatusView(), {
      wrapper: ({ children }) => wrapper({ children, stages: { mapping: false } }),
    });
    expect(result.current.view).toBe('idle');
  });

  it('returns mappingErrorDetail null when view is not error from mismatches', () => {
    vi.mocked(useImporterStatus).mockReturnValue({
      status: 'idle',
      progressEventTarget: new EventTarget(),
    });
    vi.mocked(useConvert).mockReturnValue({
      convert: vi.fn(),
      convertedSheet: null,
      convertResult: {
        kind: 'mismatch',
        headersFound: [],
        mismatches: [],
        columnOrder: [],
        headerToFieldMap: {},
      },
    } as ReturnType<typeof useConvert>);
    const { result } = renderHook(() => useStatusView(), {
      wrapper: ({ children }) => wrapper({ children }),
    });
    expect(result.current.mappingErrorDetail).toBeNull();
  });

  it('returns process and auto-applies when mismatches <= autoApplyMappingWhenMismatchesAtMost', () => {
    const applyMapping = vi.fn();
    vi.mocked(useImporterStatus).mockReturnValue({
      status: 'idle',
      progressEventTarget: new EventTarget(),
    });
    vi.mocked(useConvert).mockReturnValue({
      convert: vi.fn(),
      convertedSheet: null,
      convertResult: {
        kind: 'mismatch',
        headersFound: ['A'],
        mismatches: [{ expected: 'a', actual: 'A' }],
        columnOrder: [],
        headerToFieldMap: {},
        applyMapping,
      },
    } as ReturnType<typeof useConvert>);
    const { result } = renderHook(() => useStatusView(), {
      wrapper: ({ children }) => wrapper({ children, autoApplyMappingWhenMismatchesAtMost: 1 }),
    });
    expect(result.current.view).toBe('process');
    expect(result.current.mappingErrorDetail).toBeNull();
    expect(applyMapping).toHaveBeenCalled();
  });

  it('returns mapping when mismatches > autoApplyMappingWhenMismatchesAtMost', () => {
    vi.mocked(useImporterStatus).mockReturnValue({
      status: 'idle',
      progressEventTarget: new EventTarget(),
    });
    vi.mocked(useConvert).mockReturnValue({
      convert: vi.fn(),
      convertedSheet: null,
      convertResult: {
        kind: 'mismatch',
        headersFound: ['A', 'B'],
        mismatches: [
          { expected: 'a', actual: 'A' },
          { expected: 'b', actual: 'B' },
        ],
        columnOrder: [],
        headerToFieldMap: {},
      },
    } as ReturnType<typeof useConvert>);
    const { result } = renderHook(() => useStatusView(), {
      wrapper: ({ children }) => wrapper({ children, autoApplyMappingWhenMismatchesAtMost: 1 }),
    });
    expect(result.current.view).toBe('mapping');
    expect(result.current.mappingErrorDetail).toBeNull();
  });

  it('returns error and mappingErrorDetail when mismatches > showErrorWhenMismatchesAbove', () => {
    vi.mocked(useImporterStatus).mockReturnValue({
      status: 'idle',
      progressEventTarget: new EventTarget(),
    });
    vi.mocked(useConvert).mockReturnValue({
      convert: vi.fn(),
      convertedSheet: null,
      convertResult: {
        kind: 'mismatch',
        headersFound: ['A', 'B', 'C'],
        mismatches: [
          { expected: 'a', actual: 'A' },
          { expected: 'b', actual: 'B' },
          { expected: 'c', actual: 'C' },
        ],
        columnOrder: [],
        headerToFieldMap: {},
      },
    } as ReturnType<typeof useConvert>);
    const { result } = renderHook(() => useStatusView(), {
      wrapper: ({ children }) => wrapper({ children, showErrorWhenMismatchesAbove: 2 }),
    });
    expect(result.current.view).toBe('error');
    expect(result.current.mappingErrorDetail).toEqual({
      code: 'TOO_MANY_MISMATCHES',
      mismatchCount: 3,
      maxAllowed: 2,
    });
  });
});
