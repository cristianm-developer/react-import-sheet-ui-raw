import { forwardRef, type ReactNode } from 'react';
import { useStatusView } from '../../hooks/useStatusView';
import { RawFilePicker } from '../RawFilePicker';
import { RawMappingTable } from '../RawMappingTable';
import { RawMappingRow } from '../RawMappingRow';
import { RawMappingSuggest } from '../RawMappingSuggest';
import { RawImportAction } from '../RawImportAction';
import { RawProgressDisplay } from '../RawProgressDisplay';
import { RawStatusIndicator } from '../RawStatusIndicator';
import { RawAbortButton } from '../RawAbortButton';
import { RawViewPhaseProvider } from '../../hooks/useRawPagination';
import { RawDataTableProvider } from '../../hooks/useRawDataTable';
import { useRawTableHead } from '../../hooks/useRawTableHead';
import { useRawTableBody } from '../../hooks/useRawTableBody';
import { useRawTableRow } from '../../hooks/useRawTableRow';
import { useRawCell } from '../../hooks/useRawCell';
import { useRawErrorBadge } from '../../hooks/useRawErrorBadge';
import { useRawFilterToggle } from '../../hooks/useRawFilterToggle';
import { useRawExport } from '../../hooks/useRawExport';
import { useRawPagination } from '../../hooks/useRawPagination';
import { useRawPersistence } from '../../hooks/useRawPersistence';
import type { MappingErrorDetail } from '../../hooks/useStatusView/types';
import type { RawImporterWorkflowProps } from './types';

function DefaultIdle() {
  return (
    <RawFilePicker>
      {(state) => (
        <span data-ris-ui="raw-file-picker-prompt">
          {state.isDragging ? 'Drop file here' : 'Click or drop file here'}
        </span>
      )}
    </RawFilePicker>
  );
}

function DefaultMapping() {
  return (
    <RawMappingTable>
      {(state) =>
        state.rows.map((rowContext) => (
          <RawMappingRow key={rowContext.columnIndex} rowContext={rowContext}>
            {(rowState) => (
              <>
                <span>{rowState.headerOriginal}</span>
                <RawMappingSuggest
                  columnContext={{
                    fileHeader: rowContext.headerOriginal,
                    columnIndex: rowContext.columnIndex,
                  }}
                >
                  {(suggestState) =>
                    suggestState.suggestedFieldId != null ? (
                      <span data-ris-ui="raw-mapping-suggest-badge">
                        {suggestState.suggestedFieldLabel} ({suggestState.matchScore}%)
                      </span>
                    ) : null
                  }
                </RawMappingSuggest>
                <select
                  value={rowState.value ?? ''}
                  onChange={(e) => rowState.onChange(e.target.value)}
                  aria-label={`Map ${rowState.headerOriginal}`}
                >
                  <option value="">—</option>
                  {rowState.options.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </>
            )}
          </RawMappingRow>
        ))
      }
    </RawMappingTable>
  );
}

function DefaultMappingWithAction() {
  return (
    <>
      <DefaultMapping />
      <RawImportAction>
        {(state) => (
          <button
            type="button"
            disabled={state.disabled}
            onClick={state.runImport}
            aria-label="Run import"
          >
            Import
          </button>
        )}
      </RawImportAction>
    </>
  );
}

function DefaultProcess() {
  return (
    <>
      <RawProgressDisplay>
        {(state) => <div data-ris-ui="raw-progress">{String(state.progressRef?.current ?? 0)}</div>}
      </RawProgressDisplay>
      <RawStatusIndicator>
        {(state) => <div data-ris-ui="raw-status">{state.status}</div>}
      </RawStatusIndicator>
      <RawAbortButton />
    </>
  );
}

function ResultToolbar() {
  const filter = useRawFilterToggle();
  const exportApi = useRawExport();
  return (
    <div data-ris-ui="raw-workflow-toolbar" role="toolbar">
      <button
        type="button"
        onClick={() => filter.setFilterMode(filter.filterMode === 'all' ? 'errors-only' : 'all')}
        aria-pressed={filter.filterMode === 'errors-only'}
      >
        {filter.filterMode === 'all' ? 'All' : 'Errors only'}
      </button>
      <button type="button" onClick={() => exportApi.downloadCSV?.()}>
        Export CSV
      </button>
      <button type="button" onClick={() => exportApi.downloadJSON?.()}>
        Export JSON
      </button>
    </div>
  );
}

function ResultGrid() {
  const { headers } = useRawTableHead();
  const { totalRowCount } = useRawTableBody();
  const { page, pageSize } = useRawPagination();
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, totalRowCount);
  const indices = Array.from({ length: end - start }, (_, i) => start + i);

  return (
    <table data-ris-ui="raw-workflow-grid" role="grid">
      <thead>
        <tr role="row">
          {headers.map((h) => (
            <th key={h.id} scope="col" role="columnheader">
              {h.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {indices.map((index) => (
          <ResultRow key={index} index={index} headerIds={headers.map((h) => h.id)} />
        ))}
      </tbody>
    </table>
  );
}

function ResultRow({ index, headerIds }: { index: number; headerIds: string[] }) {
  const row = useRawTableRow({ index });
  return (
    <tr {...row.getRowProps()}>
      {headerIds.map((fieldId) => (
        <ResultCell key={fieldId} rowIndex={index} fieldId={fieldId} />
      ))}
    </tr>
  );
}

function ResultCell({ rowIndex, fieldId }: { rowIndex: number; fieldId: string }) {
  const cell = useRawCell({ rowIndex, fieldId });
  const error = cell.errors?.[0];
  const badge = useRawErrorBadge({
    error: error ?? null,
    translateError: undefined,
  });

  return (
    <td {...cell.getCellProps()}>
      {cell.isEditing ? (
        <input {...cell.getEditInputProps()} />
      ) : (
        <span>{String(cell.value ?? '')}</span>
      )}
      {badge.message ? <span {...cell.getErrorProps()}>{badge.message}</span> : null}
    </td>
  );
}

function ResultFooter() {
  const pagination = useRawPagination();
  const persistence = useRawPersistence();

  return (
    <div data-ris-ui="raw-workflow-footer" role="contentinfo">
      <div data-ris-ui="raw-workflow-pagination">
        <button
          type="button"
          disabled={pagination.page <= 1}
          onClick={() => pagination.setPage(pagination.page - 1)}
          aria-label="Previous page"
        >
          Previous
        </button>
        <span>
          Page {pagination.page} of{' '}
          {Math.max(1, Math.ceil(pagination.totalRows / pagination.pageSize))}
        </span>
        <button
          type="button"
          disabled={pagination.page >= Math.ceil(pagination.totalRows / pagination.pageSize)}
          onClick={() => pagination.setPage(pagination.page + 1)}
          aria-label="Next page"
        >
          Next
        </button>
      </div>
      {persistence.hasRecoverableSession ? (
        <div data-ris-ui="raw-workflow-persistence">
          <button type="button" onClick={persistence.recoverSession}>
            Recover session
          </button>
          <button type="button" onClick={persistence.clearSession}>
            Clear
          </button>
        </div>
      ) : null}
    </div>
  );
}

function DefaultResult() {
  return (
    <RawViewPhaseProvider>
      <ResultToolbar />
      <RawDataTableProvider>
        <ResultGrid />
      </RawDataTableProvider>
      <ResultFooter />
    </RawViewPhaseProvider>
  );
}

function DefaultError({ mappingErrorDetail }: { mappingErrorDetail: MappingErrorDetail | null }) {
  if (mappingErrorDetail?.code === 'TOO_MANY_MISMATCHES') {
    return (
      <div data-ris-ui="raw-workflow-mapping-error" role="alert">
        Too many column mismatches ({mappingErrorDetail.mismatchCount}). Maximum allowed:{' '}
        {mappingErrorDetail.maxAllowed}.
      </div>
    );
  }
  return <DefaultIdle />;
}

export const RawImporterWorkflow = forwardRef<HTMLDivElement, RawImporterWorkflowProps>(
  function RawImporterWorkflow(
    { className, style, renderIdle, renderMapping, renderProcess, renderResult, renderError },
    ref
  ) {
    const { view, mappingErrorDetail } = useStatusView();

    let content: ReactNode;
    switch (view) {
      case 'idle':
        content = renderIdle ? renderIdle() : <DefaultIdle />;
        break;
      case 'mapping':
        content = renderMapping ? renderMapping() : <DefaultMappingWithAction />;
        break;
      case 'process':
        content = renderProcess ? renderProcess() : <DefaultProcess />;
        break;
      case 'result':
        content = renderResult ? renderResult() : <DefaultResult />;
        break;
      case 'error':
        content = renderError ? (
          renderError({ mappingErrorDetail })
        ) : (
          <DefaultError mappingErrorDetail={mappingErrorDetail} />
        );
        break;
      default:
        content = renderIdle ? renderIdle() : <DefaultIdle />;
    }

    return (
      <div ref={ref} className={className} style={style} data-ris-ui="raw-importer-workflow">
        {content}
      </div>
    );
  }
);
