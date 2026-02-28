import type { CSSProperties } from 'react';

export interface UseRawFilePickerOptions {
  /** Accepted file types (e.g. ".xlsx,.csv" or "application/vnd.ms-excel"). */
  accept?: string;
}

export interface GetRootPropsOptions {
  className?: string;
  style?: CSSProperties;
}

export interface UseRawFilePickerReturn {
  isDragging: boolean;
  getRootProps: (options?: GetRootPropsOptions) => {
    ref: (el: HTMLElement | null) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    role: string;
    'aria-dropzone'?: string;
    className?: string;
    style?: CSSProperties;
  };
  getInputProps: () => {
    ref: (el: HTMLInputElement | null) => void;
    type: 'file';
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    accept?: string;
    tabIndex?: number;
    'aria-label'?: string;
  };
}
