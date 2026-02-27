import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RawAbortController } from './RawAbortController';

const mockAbort = vi.fn();

vi.mock('@cristianm/react-import-sheet-headless', () => ({
  useImporter: () => ({ abort: mockAbort }),
}));

describe('RawAbortController', () => {
  beforeEach(() => {
    mockAbort.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders button with children', () => {
    render(<RawAbortController>Cancelar</RawAbortController>);
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('calls abort on click', () => {
    render(<RawAbortController>Cancel</RawAbortController>);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockAbort).toHaveBeenCalledTimes(1);
  });

  it('applies className and style', () => {
    render(
      <RawAbortController className="btn" style={{ color: 'red' }}>
        Cancel
      </RawAbortController>
    );
    const btn = screen.getByRole('button', { name: 'Cancel' });
    expect(btn).toHaveClass('btn');
    expect(btn).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('is disabled when disabled prop is true', () => {
    render(<RawAbortController disabled>Cancel</RawAbortController>);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('has data-ris-ui attribute', () => {
    render(<RawAbortController>Cancel</RawAbortController>);
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute(
      'data-ris-ui',
      'raw-abort-controller'
    );
  });
});
