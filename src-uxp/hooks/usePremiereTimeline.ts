import { useState, useEffect, useCallback } from "react";
import { applicationContainer } from "../app/application";
import type { PremiereTimelineContext } from "../premiere/models";

let cachedTimelineContext: PremiereTimelineContext | null = null;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach(l => l());

export function usePremiereTimeline() {
  const [context, setContext] = useState<PremiereTimelineContext | null>(cachedTimelineContext);
  const [loading, setLoading] = useState(!cachedTimelineContext);
  
  const refreshTimeline = useCallback(async () => {
    setLoading(true);
    try {
      const result = await applicationContainer.premiereTimelineService.getTimelineContext();
      cachedTimelineContext = result;
      setContext(result);
      notify();
    } catch (e) {
      console.error("Failed to refresh premiere timeline context", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handle = () => setContext(cachedTimelineContext);
    listeners.add(handle);
    if (!cachedTimelineContext) refreshTimeline();
    return () => { listeners.delete(handle); };
  }, [refreshTimeline]);

  return { timelineContext: context, loadingTimeline: loading, refreshTimeline };
}
