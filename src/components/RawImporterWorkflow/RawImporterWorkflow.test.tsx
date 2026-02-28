import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RawImporterRoot } from '../RawImporterRoot';
import { RawImporterWorkflow } from './RawImporterWorkflow';

const layout = { name: 'Test', version: '1', fields: { a: { name: 'A' } } };

vi.mock('../../hooks/useStatusView', () => ({
  useStatusView: vi.fn(),
}));

const { useStatusView } = await import('../../hooks/useStatusView');

function renderWithRoot(ui: React.ReactElement) {
  return render(
    <RawImporterRoot layout={layout} engine="auto">
      {ui}
    </RawImporterRoot>
  );
}

describe('RawImporterWorkflow', () => {
  it('renders container with data-ris-ui raw-importer-workflow', () => {
    vi.mocked(useStatusView).mockReturnValue({
      view: 'idle',
      status: 'idle',
      progressEventTarget: new EventTarget(),
      convertResult: null,
      mappingErrorDetail: null,
    });
    const { container } = renderWithRoot(<RawImporterWorkflow />);
    expect(container.querySelector('[data-ris-ui="raw-importer-workflow"]')).toBeInTheDocument();
  });

  it('renders default idle content (RawFilePicker) when view is idle', () => {
    vi.mocked(useStatusView).mockReturnValue({
      view: 'idle',
      status: 'idle',
      progressEventTarget: new EventTarget(),
      convertResult: null,
      mappingErrorDetail: null,
    });
    renderWithRoot(<RawImporterWorkflow />);
    expect(document.querySelector('[data-ris-ui="raw-file-picker"]')).toBeInTheDocument();
  });

  it('renders custom renderIdle when provided and view is idle', () => {
    vi.mocked(useStatusView).mockReturnValue({
      view: 'idle',
      status: 'idle',
      progressEventTarget: new EventTarget(),
      convertResult: null,
      mappingErrorDetail: null,
    });
    renderWithRoot(
      <RawImporterWorkflow renderIdle={() => <span data-testid="custom-idle">Custom idle</span>} />
    );
    expect(screen.getByTestId('custom-idle')).toHaveTextContent('Custom idle');
  });

  it('renders default mapping section when view is mapping', () => {
    vi.mocked(useStatusView).mockReturnValue({
      view: 'mapping',
      status: 'idle',
      progressEventTarget: new EventTarget(),
      convertResult: {},
      mappingErrorDetail: null,
    });
    renderWithRoot(<RawImporterWorkflow />);
    expect(document.querySelector('[data-ris-ui="raw-mapping-table"]')).toBeInTheDocument();
    expect(document.querySelector('[data-ris-ui="raw-import-action"]')).toBeInTheDocument();
  });

  it('renders custom renderMapping when provided and view is mapping', () => {
    vi.mocked(useStatusView).mockReturnValue({
      view: 'mapping',
      status: 'idle',
      progressEventTarget: new EventTarget(),
      convertResult: {},
      mappingErrorDetail: null,
    });
    renderWithRoot(
      <RawImporterWorkflow
        renderMapping={() => <span data-testid="custom-mapping">Custom mapping</span>}
      />
    );
    expect(screen.getByTestId('custom-mapping')).toHaveTextContent('Custom mapping');
  });

  it('renders default process section when view is process', () => {
    vi.mocked(useStatusView).mockReturnValue({
      view: 'process',
      status: 'validating',
      progressEventTarget: new EventTarget(),
      convertResult: null,
      mappingErrorDetail: null,
    });
    renderWithRoot(<RawImporterWorkflow />);
    expect(document.querySelector('[data-ris-ui="raw-progress-display"]')).toBeInTheDocument();
    expect(document.querySelector('[data-ris-ui="raw-status-indicator"]')).toBeInTheDocument();
    expect(document.querySelector('[data-ris-ui="raw-abort-button"]')).toBeInTheDocument();
  });

  it('renders custom renderProcess when provided and view is process', () => {
    vi.mocked(useStatusView).mockReturnValue({
      view: 'process',
      status: 'validating',
      progressEventTarget: new EventTarget(),
      convertResult: null,
      mappingErrorDetail: null,
    });
    renderWithRoot(
      <RawImporterWorkflow
        renderProcess={() => <span data-testid="custom-process">Processing…</span>}
      />
    );
    expect(screen.getByTestId('custom-process')).toHaveTextContent('Processing…');
  });

  it('renders default result section (toolbar, grid, footer) when view is result', () => {
    if (typeof Worker === 'undefined') return;
    vi.mocked(useStatusView).mockReturnValue({
      view: 'result',
      status: 'success',
      progressEventTarget: new EventTarget(),
      convertResult: null,
      mappingErrorDetail: null,
    });
    renderWithRoot(<RawImporterWorkflow />);
    expect(document.querySelector('[data-ris-ui="raw-workflow-toolbar"]')).toBeInTheDocument();
    expect(document.querySelector('[data-ris-ui="raw-workflow-grid"]')).toBeInTheDocument();
    expect(document.querySelector('[data-ris-ui="raw-workflow-footer"]')).toBeInTheDocument();
  });

  it('renders custom renderResult when provided and view is result', () => {
    vi.mocked(useStatusView).mockReturnValue({
      view: 'result',
      status: 'success',
      progressEventTarget: new EventTarget(),
      convertResult: null,
      mappingErrorDetail: null,
    });
    renderWithRoot(
      <RawImporterWorkflow renderResult={() => <span data-testid="custom-result">Results</span>} />
    );
    expect(screen.getByTestId('custom-result')).toHaveTextContent('Results');
    expect(document.querySelector('[data-ris-ui="raw-workflow-toolbar"]')).not.toBeInTheDocument();
  });

  it('renders default error as idle (retry) when view is error and no mappingErrorDetail', () => {
    vi.mocked(useStatusView).mockReturnValue({
      view: 'error',
      status: 'error',
      progressEventTarget: new EventTarget(),
      convertResult: null,
      mappingErrorDetail: null,
    });
    renderWithRoot(<RawImporterWorkflow />);
    expect(document.querySelector('[data-ris-ui="raw-file-picker"]')).toBeInTheDocument();
  });

  it('renders mapping error message when view is error and mappingErrorDetail is TOO_MANY_MISMATCHES', () => {
    vi.mocked(useStatusView).mockReturnValue({
      view: 'error',
      status: 'idle',
      progressEventTarget: new EventTarget(),
      convertResult: null,
      mappingErrorDetail: {
        code: 'TOO_MANY_MISMATCHES',
        mismatchCount: 5,
        maxAllowed: 2,
      },
    });
    renderWithRoot(<RawImporterWorkflow />);
    expect(
      document.querySelector('[data-ris-ui="raw-workflow-mapping-error"]')
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/Too many column mismatches \(5\)/);
    expect(screen.getByRole('alert')).toHaveTextContent(/Maximum allowed: 2/);
  });

  it('renders custom renderError when provided and view is error', () => {
    vi.mocked(useStatusView).mockReturnValue({
      view: 'error',
      status: 'error',
      progressEventTarget: new EventTarget(),
      convertResult: null,
      mappingErrorDetail: null,
    });
    renderWithRoot(
      <RawImporterWorkflow
        renderError={({ mappingErrorDetail }) => (
          <span data-testid="custom-error">
            {mappingErrorDetail
              ? `Mismatches: ${mappingErrorDetail.mismatchCount}`
              : 'Something went wrong'}
          </span>
        )}
      />
    );
    expect(screen.getByTestId('custom-error')).toHaveTextContent('Something went wrong');
  });
});
