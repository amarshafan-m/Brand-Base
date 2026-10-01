const fs = require('fs');

let ctxHook = fs.readFileSync('src/js/main/hooks/usePremiereContext.ts', 'utf8');
ctxHook = ctxHook.replace(
  `  useEffect(() => {
    const handle = () => setContext(cachedContext);
    listeners.add(handle);
    if (!cachedContext) refresh();
    return () => { listeners.delete(handle); };
  }, [refresh]);`,
  `  useEffect(() => {
    const handle = () => setContext(cachedContext);
    listeners.add(handle);
    refresh(); // Always refresh on mount
    const interval = setInterval(refresh, 2000); // Poll every 2 seconds
    return () => { 
      listeners.delete(handle); 
      clearInterval(interval);
    };
  }, [refresh]);`
);
fs.writeFileSync('src/js/main/hooks/usePremiereContext.ts', ctxHook);

let tlHook = fs.readFileSync('src/js/main/hooks/usePremiereTimeline.ts', 'utf8');
tlHook = tlHook.replace(
  `  useEffect(() => {
    const handle = () => setContext(cachedTimelineContext);
    listeners.add(handle);
    if (!cachedTimelineContext) refreshTimeline();
    return () => { listeners.delete(handle); };
  }, [refreshTimeline]);`,
  `  useEffect(() => {
    const handle = () => setContext(cachedTimelineContext);
    listeners.add(handle);
    refreshTimeline(); // Always refresh on mount
    const interval = setInterval(refreshTimeline, 2000); // Poll every 2 seconds
    return () => { 
      listeners.delete(handle); 
      clearInterval(interval);
    };
  }, [refreshTimeline]);`
);
fs.writeFileSync('src/js/main/hooks/usePremiereTimeline.ts', tlHook);

console.log('Patched Premiere context hooks to poll');
