import { forwardRef, useMemo } from 'react';
import { useRawAbort } from '../../hooks/useRawAbort';
import { useRawStatus } from '../../hooks/useRawStatus';
import type { RawAbortButtonProps } from './types.js';

const PROCESSING_STATUSES = ['loading', 'parsing', 'validating', 'transforming'] as const;

export const RawAbortButton = forwardRef<HTMLButtonElement, RawAbortButtonProps>(
  function RawAbortButton(
    { children, className, style, disabled: disabledProp, 'aria-label': ariaLabel },
    ref
  ) {
    const { abort } = useRawAbort();
    const { status } = useRawStatus();
    const isProcessing = PROCESSING_STATUSES.includes(
      status as (typeof PROCESSING_STATUSES)[number]
    );
    const disabled = disabledProp ?? !isProcessing;

    const buttonProps = useMemo(
      () => ({
        type: 'button' as const,
        onClick: abort,
        disabled,
        className,
        style,
        'aria-label': ariaLabel ?? 'Cancel import',
      }),
      [abort, disabled, className, style, ariaLabel]
    );

    return (
      <button ref={ref} {...buttonProps} data-ris-ui="raw-abort-button">
        {children ?? 'Cancel'}
      </button>
    );
  }
);
