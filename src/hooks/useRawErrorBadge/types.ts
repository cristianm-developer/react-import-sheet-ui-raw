import type { SheetError } from '@cristianm/react-import-sheet-headless';

export interface UseRawErrorBadgeOptions {
  /** The error to display (code, params for I18n). */
  error: SheetError | null | undefined;
  /** Optional: (code, params) => translated string. */
  translateError?: (code: string, params?: Readonly<Record<string, unknown>>) => string;
}

export interface UseRawErrorBadgeReturn {
  /** The error (code, params). */
  error: SheetError | null | undefined;
  /** Translated message when translateError is provided; otherwise error.message or code. */
  message: string;
  /** translateError if provided (for custom slot). */
  translateError?: (code: string, params?: Readonly<Record<string, unknown>>) => string;
}
