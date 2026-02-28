import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RawErrorBoundary } from './RawErrorBoundary';

function Thrower() {
  throw new Error('Test error');
}

describe('RawErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <RawErrorBoundary fallback={<div>Error fallback</div>}>
        <span>Child</span>
      </RawErrorBoundary>
    );
    expect(screen.getByText('Child')).toBeInTheDocument();
    expect(screen.queryByText('Error fallback')).not.toBeInTheDocument();
  });

  it('shows fallback and calls onError when child throws', () => {
    const onError = vi.fn();
    render(
      <RawErrorBoundary fallback={<div>Error fallback</div>} onError={onError}>
        <Thrower />
      </RawErrorBoundary>
    );
    expect(screen.getByText('Error fallback')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('renders function fallback with error and errorInfo', () => {
    const fallbackFn = vi.fn((err: Error) => <div>Caught: {err.message}</div>);
    render(
      <RawErrorBoundary fallback={fallbackFn}>
        <Thrower />
      </RawErrorBoundary>
    );
    expect(fallbackFn).toHaveBeenCalledWith(expect.any(Error), expect.any(Object));
    expect(screen.getByText(/Caught: Test error/)).toBeInTheDocument();
  });

  it('has data-ris-ui attribute on fallback container', () => {
    render(
      <RawErrorBoundary fallback={<div>Error</div>}>
        <Thrower />
      </RawErrorBoundary>
    );
    const container = document.querySelector('[data-ris-ui="raw-error-boundary"]');
    expect(container).toBeInTheDocument();
  });
});
