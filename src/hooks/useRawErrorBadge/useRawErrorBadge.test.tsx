import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useRawErrorBadge } from './useRawErrorBadge.js';

describe('useRawErrorBadge', () => {
  it('returns error and message from error.message when no translateError', () => {
    const error = { code: 'REQUIRED', message: 'Field is required', params: {} };
    const { result } = renderHook(() => useRawErrorBadge({ error }));
    expect(result.current.error).toBe(error);
    expect(result.current.message).toBe('Field is required');
  });

  it('returns message as code when error has no message', () => {
    const error = { code: 'INVALID_EMAIL' };
    const { result } = renderHook(() => useRawErrorBadge({ error }));
    expect(result.current.message).toBe('INVALID_EMAIL');
  });

  it('uses translateError when provided', () => {
    const error = { code: 'REQUIRED', params: { field: 'email' } };
    const translateError = (code: string, params?: Record<string, unknown>) =>
      `${code}: ${params?.field ?? ''}`;
    const { result } = renderHook(() => useRawErrorBadge({ error, translateError }));
    expect(result.current.message).toBe('REQUIRED: email');
    expect(result.current.translateError).toBe(translateError);
  });

  it('returns empty message when error is null', () => {
    const { result } = renderHook(() => useRawErrorBadge({ error: null }));
    expect(result.current.error).toBeNull();
    expect(result.current.message).toBe('');
  });
});
