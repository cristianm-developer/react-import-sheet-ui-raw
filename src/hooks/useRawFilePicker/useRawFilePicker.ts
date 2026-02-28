import { useCallback, useRef, useState } from 'react';
import { useImporter } from '@cristianm/react-import-sheet-headless';
import type {
  GetRootPropsOptions,
  UseRawFilePickerOptions,
  UseRawFilePickerReturn,
} from './types.js';

export function useRawFilePicker(options: UseRawFilePickerOptions = {}): UseRawFilePickerReturn {
  const { accept } = options;
  const { processFile } = useImporter();
  const [isDragging, setIsDragging] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const setRootRef = useCallback((el: HTMLElement | null) => {
    rootRef.current = el;
  }, []);

  const setInputRef = useCallback((el: HTMLInputElement | null) => {
    inputRef.current = el;
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!rootRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = '';
    },
    [processFile]
  );

  const getRootProps = useCallback(
    (opts?: GetRootPropsOptions) => ({
      ref: setRootRef,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      role: 'button',
      'aria-dropzone': 'true',
      className: opts?.className,
      style: opts?.style,
    }),
    [handleDragOver, handleDragLeave, handleDrop, setRootRef]
  );

  const getInputProps = useCallback(
    () => ({
      ref: setInputRef,
      type: 'file' as const,
      onChange: handleChange,
      accept: accept ?? '.xlsx,.xls,.csv',
      tabIndex: -1,
      'aria-label': 'Select file to import',
    }),
    [handleChange, setInputRef, accept]
  );

  return {
    isDragging,
    getRootProps,
    getInputProps,
  };
}
