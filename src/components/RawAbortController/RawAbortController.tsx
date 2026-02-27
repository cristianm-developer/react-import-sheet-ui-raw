import React, { forwardRef } from 'react';
import { useImporter } from '@cristianm/react-import-sheet-headless';

export interface RawAbortControllerProps {
  /** Optional class name for the button. */
  className?: string;
  /** Optional inline styles for the button. */
  style?: React.CSSProperties;
  /** Button content (e.g. "Cancelar"). */
  children?: React.ReactNode;
  /** When true, the button is disabled. */
  disabled?: boolean;
  /** Optional aria-label for accessibility. */
  'aria-label'?: string;
}

const RawAbortControllerInner = (
  props: RawAbortControllerProps,
  ref: React.ForwardedRef<HTMLButtonElement>,
) => {
  const {
    className,
    style,
    children,
    disabled = false,
    'aria-label': ariaLabel,
  } = props;

  const { abort } = useImporter();

  return (
    <button
      ref={ref}
      type="button"
      className={className}
      style={style}
      disabled={disabled}
      aria-label={ariaLabel}
      data-ris-ui="raw-abort-controller"
      onClick={() => abort()}
    >
      {children}
    </button>
  );
};

export const RawAbortController = forwardRef<
  HTMLButtonElement,
  RawAbortControllerProps
>(RawAbortControllerInner);

RawAbortController.displayName = 'RawAbortController';
