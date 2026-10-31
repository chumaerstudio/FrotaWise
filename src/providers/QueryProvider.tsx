'use client';

import React, { createContext, useContext, useCallback, useState } from 'react';
import { clearSessionScopedCaches } from '@/lib/queryKeys';

interface ServerCacheContextValue {
  revision: number;
  invalidateTenantCache: () => void;
  resetAllSessionData: () => void;
}

const ServerCacheContext = createContext<ServerCacheContextValue>({
  revision: 0,
  invalidateTenantCache: () => undefined,
  resetAllSessionData: () => undefined,
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [revision, setRevision] = useState(0);

  const invalidateTenantCache = useCallback(() => {
    setRevision((prev) => prev + 1);
  }, []);

  const resetAllSessionData = useCallback(() => {
    clearSessionScopedCaches();
    setRevision((prev) => prev + 1);
  }, []);

  return (
    <ServerCacheContext.Provider
      value={{ revision, invalidateTenantCache, resetAllSessionData }}
    >
      {children}
    </ServerCacheContext.Provider>
  );
}

export function useServerCache() {
  return useContext(ServerCacheContext);
}
