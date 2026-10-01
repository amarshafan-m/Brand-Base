import { useCallback, useEffect, useState } from "react";
import { applicationContainer, initializeApplication } from "../app/application";
import type { ApplicationContainer } from "../services/container";

let globalRevision = 0;
const listeners = new Set<() => void>();

export const triggerGlobalReload = () => {
  globalRevision++;
  listeners.forEach(listener => listener());
};

export interface ApplicationDataState<T> {
  data?: T;
  error?: Error;
  loading: boolean;
  reload: () => void;
}

export function useApplicationData<T>(
  loader: (container: ApplicationContainer) => Promise<T>,
  dependencies: readonly unknown[] = [],
): ApplicationDataState<T> {
  const [revision, setRevision] = useState(globalRevision);
  const [state, setState] = useState<Omit<ApplicationDataState<T>, "reload">>({ loading: true });
  
  const reload = useCallback(() => {
    triggerGlobalReload();
  }, []);

  useEffect(() => {
    const listener = () => setRevision(globalRevision);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: undefined }));
    void initializeApplication()
      .then(() => loader(applicationContainer))
      .then((data) => { if (active) setState({ data, loading: false }); })
      .catch((error: unknown) => { if (active) setState({ loading: false, error: error instanceof Error ? error : new Error("Brand Base data could not be loaded.") }); });
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision, ...dependencies]);

  return { ...state, reload };
}
