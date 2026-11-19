import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchCatalog } from '../api/client';
import { FALLBACK_CATALOG } from '../data/fallbackCatalog';
import type { Catalog } from '../types/catalog';

interface CatalogContextValue {
  catalog: Catalog;
  refreshing: boolean;
  refresh: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue>({
  catalog: FALLBACK_CATALOG,
  refreshing: false,
  refresh: async () => {},
});

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog>(FALLBACK_CATALOG);
  const [refreshing, setRefreshing] = useState(true);

  const load = async () => {
    setRefreshing(true);
    const next = await fetchCatalog();
    setCatalog(next);
    setRefreshing(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const value = useMemo(() => ({ catalog, refreshing, refresh: load }), [catalog, refreshing]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  return useContext(CatalogContext);
}
