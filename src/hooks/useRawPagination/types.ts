export interface UseRawPaginationReturn {
  page: number;
  pageSize: number;
  totalRows: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}
