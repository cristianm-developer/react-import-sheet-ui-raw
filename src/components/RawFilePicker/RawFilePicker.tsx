import { forwardRef, useCallback } from 'react';
import { useRawFilePicker } from '../../hooks/useRawFilePicker';
import type { RawFilePickerProps } from './types';

export const RawFilePicker = forwardRef<HTMLDivElement, RawFilePickerProps>(function RawFilePicker(
  { children, className, style },
  ref
) {
  const state = useRawFilePicker();
  const rootProps = state.getRootProps({ className, style });
  const { ref: rootRef, ...restRootProps } = rootProps;
  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      (rootRef as (el: HTMLElement | null) => void)(el);
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
    },
    [rootRef, ref]
  );
  return (
    <div ref={setRef} {...restRootProps} data-ris-ui="raw-file-picker">
      <input {...state.getInputProps()} />
      {children(state)}
    </div>
  );
});
