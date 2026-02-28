import { describe, expect, it } from 'vitest';
import { getViewFromState } from './status-views';

describe('getViewFromState', () => {
  it('returns mapping when convertResult is not null', () => {
    expect(getViewFromState('idle', {})).toBe('mapping');
    expect(getViewFromState('loading', { kind: 'mismatch' })).toBe('mapping');
    expect(getViewFromState('success', { headersFound: [] })).toBe('mapping');
  });

  it('returns idle for idle, loading, parsing when convertResult is null', () => {
    expect(getViewFromState('idle', null)).toBe('idle');
    expect(getViewFromState('loading', null)).toBe('idle');
    expect(getViewFromState('parsing', null)).toBe('idle');
  });

  it('returns process for validating, transforming', () => {
    expect(getViewFromState('validating', null)).toBe('process');
    expect(getViewFromState('transforming', null)).toBe('process');
  });

  it('returns result for success', () => {
    expect(getViewFromState('success', null)).toBe('result');
  });

  it('returns error for error and cancelled', () => {
    expect(getViewFromState('error', null)).toBe('error');
    expect(getViewFromState('cancelled', null)).toBe('error');
  });

  it('returns idle when convertResult is undefined', () => {
    expect(getViewFromState('idle', undefined)).toBe('idle');
  });
});
