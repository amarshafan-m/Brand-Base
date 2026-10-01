import { useState, useEffect, useCallback } from "react";
import { applicationContainer } from "../app/application";
import type { PremiereContext } from "../premiere/models";

// Global cache for context to avoid flickering on re-renders, 
// and a subscription model if we want it, but simple explicit refresh is required by Phase 6A.
let cachedContext: PremiereContext | null = null;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach(l => l());

export function usePremiereContext() {
  const [context, setContext] = useState<PremiereContext | null>(cachedContext);
  const [loading, setLoading] = useState(!cachedContext);
  
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await applicationContainer.premiereAdapter.getContext();
      cachedContext = result;
      setContext(result);
      notify();
    } catch (e) {
      console.error("Failed to refresh premiere context", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handle = () => setContext(cachedContext);
    listeners.add(handle);
    if (!cachedContext) refresh();
    return () => { listeners.delete(handle); };
  }, [refresh]);

  return { context, loading, refresh };
}
