import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ImporterProvider } from '@cristianm/react-import-sheet-headless';
import { useRawFilePicker } from './useRawFilePicker';

const layout = { name: 'Test', version: '1', fields: { a: { name: 'A' } } };

function wrapper({ children }: { children: React.ReactNode }) {
  return <ImporterProvider layout={layout}>{children}</ImporterProvider>;
}

describe('useRawFilePicker', () => {
  it('returns isDragging, getRootProps, getInputProps', () => {
    const { result } = renderHook(() => useRawFilePicker(), { wrapper });
    expect(result.current.isDragging).toBe(false);
    expect(typeof result.current.getRootProps).toBe('function');
    expect(typeof result.current.getInputProps).toBe('function');
  });

  it('getRootProps returns ref, onDragOver, onDragLeave, onDrop, role, aria-dropzone', () => {
    const { result } = renderHook(() => useRawFilePicker(), { wrapper });
    const props = result.current.getRootProps();
    expect(props.ref).toBeDefined();
    expect(typeof props.onDragOver).toBe('function');
    expect(typeof props.onDragLeave).toBe('function');
    expect(typeof props.onDrop).toBe('function');
    expect(props.role).toBe('button');
    expect(props['aria-dropzone']).toBe('true');
  });

  it('getRootProps merges className and style', () => {
    const { result } = renderHook(() => useRawFilePicker(), { wrapper });
    const props = result.current.getRootProps({ className: 'my-class', style: { padding: 8 } });
    expect(props.className).toBe('my-class');
    expect(props.style).toEqual({ padding: 8 });
  });

  it('getInputProps returns type file, onChange, accept', () => {
    const { result } = renderHook(() => useRawFilePicker({ accept: '.csv' }), { wrapper });
    const props = result.current.getInputProps();
    expect(props.type).toBe('file');
    expect(typeof props.onChange).toBe('function');
    expect(props.accept).toBe('.csv');
  });

  it('sets isDragging on drag over and clears on drag leave', () => {
    const { result } = renderHook(() => useRawFilePicker(), { wrapper });
    expect(result.current.isDragging).toBe(false);
    act(() => {
      result.current.getRootProps().onDragOver({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: { dropEffect: '' },
      } as unknown as React.DragEvent);
    });
    expect(result.current.isDragging).toBe(true);
    act(() => {
      result.current.getRootProps().onDragLeave({
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        relatedTarget: null,
      } as unknown as React.DragEvent);
    });
    expect(result.current.isDragging).toBe(false);
  });
});
