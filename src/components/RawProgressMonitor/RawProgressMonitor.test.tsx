import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { RawProgressMonitor } from './RawProgressMonitor';

afterEach(() => cleanup());

const { progressEventTarget, IMPORTER_PROGRESS_EVENT, IMPORTER_ABORTED_EVENT } = vi.hoisted(() => {
  return {
    progressEventTarget: new EventTarget(),
    IMPORTER_PROGRESS_EVENT: 'importer-progress',
    IMPORTER_ABORTED_EVENT: 'importer-aborted',
  };
});

vi.mock('@cristianm/react-import-sheet-headless', () => ({
  useImporterStatus: () => ({ progressEventTarget }),
  IMPORTER_PROGRESS_EVENT,
  IMPORTER_ABORTED_EVENT,
}));

describe('RawProgressMonitor', () => {
  it('renders root div with data-ris-ui', () => {
    render(<RawProgressMonitor />);
    expect(document.querySelector('[data-ris-ui="raw-progress-monitor"]')).toBeInTheDocument();
  });

  it('renders children render prop with initial phase and aborted', () => {
    render(
      <RawProgressMonitor>
        {({ phase, aborted }) => (
          <>
            <span data-testid="phase">{phase}</span>
            <span data-testid="aborted">{String(aborted)}</span>
          </>
        )}
      </RawProgressMonitor>
    );
    expect(screen.getByTestId('phase')).toHaveTextContent('');
    expect(screen.getByTestId('aborted')).toHaveTextContent('false');
  });

  it('updates phase when progress event is dispatched', async () => {
    const { container } = render(
      <RawProgressMonitor>
        {({ phase }) => <span data-testid="phase">{phase}</span>}
      </RawProgressMonitor>
    );
    progressEventTarget.dispatchEvent(
      new CustomEvent(IMPORTER_PROGRESS_EVENT, { detail: { phase: 'parsing' } })
    );
    await waitFor(() => {
      expect(container.querySelector('[data-testid="phase"]')).toHaveTextContent('parsing');
    });
  });

  it('sets aborted when abort event is dispatched', async () => {
    const { container } = render(
      <RawProgressMonitor>
        {({ aborted }) => <span data-testid="aborted">{String(aborted)}</span>}
      </RawProgressMonitor>
    );
    progressEventTarget.dispatchEvent(new Event(IMPORTER_ABORTED_EVENT));
    await waitFor(() => {
      expect(container.querySelector('[data-testid="aborted"]')).toHaveTextContent('true');
    });
  });

  it('calls onProgress when progress event is dispatched', () => {
    const onProgress = vi.fn();
    render(<RawProgressMonitor onProgress={onProgress}>{() => null}</RawProgressMonitor>);
    const detail = { phase: 'transforming', globalPercent: 50 };
    progressEventTarget.dispatchEvent(new CustomEvent(IMPORTER_PROGRESS_EVENT, { detail }));
    expect(onProgress).toHaveBeenCalledWith(detail);
  });

  it('applies className and style', () => {
    const { container } = render(
      <RawProgressMonitor className="monitor" style={{ padding: 8 }}>
        {() => null}
      </RawProgressMonitor>
    );
    const el = container.querySelector('[data-ris-ui="raw-progress-monitor"]');
    expect(el).toHaveClass('monitor');
    expect(el).toHaveStyle({ padding: '8px' });
  });
});
