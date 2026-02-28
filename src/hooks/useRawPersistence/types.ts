export interface UseRawPersistenceReturn {
  hasRecoverableSession: boolean;
  recoverSession: () => Promise<void>;
  clearSession: () => Promise<void>;
}
