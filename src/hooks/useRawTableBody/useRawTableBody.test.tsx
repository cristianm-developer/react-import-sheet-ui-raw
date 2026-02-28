import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useRawTableBody } from './useRawTableBody.js';

vi.mock('@cristianm/react-import-sheet-headless', () => ({
  useSheetData: vi.fn(),
}));

const { useSheetData } = await import('@cristianm/react-import-sheet-headless');

describe('useRawTableBody', () => {
  it('returns totalRowCount 0 when no sheet', () => {
    vi.mocked(useSheetData).mockReturnValue({ sheet: null, errors: [] });
    const { result } = renderHook(() => useRawTableBody());
    expect(result.current.totalRowCount).toBe(0);
  });

  it('returns totalRowCount from sheet.rows.length', () => {
    vi.mocked(useSheetData).mockReturnValue({
      sheet: { rows: [{ index: 0, errors: [], cells: [] }], errors: [] } as never,
      errors: [],
    });
    const { result } = renderHook(() => useRawTableBody());
    expect(result.current.totalRowCount).toBe(1);
  });

  it('getRowProps returns key, data-row-index, role, aria-rowindex', () => {
    vi.mocked(useSheetData).mockReturnValue({
      sheet: { rows: [{ index: 0, errors: [], cells: [] }], errors: [] } as never,
      errors: [],
    });
    const { result } = renderHook(() => useRawTableBody());
    const props = result.current.getRowProps({ index: 0, style: { height: 30 } });
    expect(props.key).toBe(0);
    expect(props['data-row-index']).toBe(0);
    expect(props.role).toBe('row');
    expect(props['aria-rowindex']).toBe(1);
    expect(props.style).toEqual({ height: 30 });
  });

  it('getRowProps sets data-has-errors when row has errors', () => {
    vi.mocked(useSheetData).mockReturnValue({
      sheet: {
        rows: [{ index: 0, errors: [{ code: 'ERR' }], cells: [] }],
        errors: [],
      } as never,
      errors: [],
    });
    const { result } = renderHook(() => useRawTableBody());
    const props = result.current.getRowProps({ index: 0 });
    expect(props['data-has-errors']).toBe(true);
  });

  it('isPlaceholder returns true for index >= totalRowCount', () => {
    vi.mocked(useSheetData).mockReturnValue({
      sheet: { rows: [{ index: 0, errors: [], cells: [] }], errors: [] } as never,
      errors: [],
    });
    const { result } = renderHook(() => useRawTableBody());
    expect(result.current.isPlaceholder(0)).toBe(false);
    expect(result.current.isPlaceholder(1)).toBe(true);
    expect(result.current.isPlaceholder(-1)).toBe(true);
  });
});
