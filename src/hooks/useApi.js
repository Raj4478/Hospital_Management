import { useCallback, useEffect, useRef, useState } from "react";
import { api, unwrap, errorMessage } from "../lib/api";

export function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/**
 * Fetches `url` with `params`, re-fetching whenever they change.
 * Returns { data, error, loading, reload }. Stale responses are ignored.
 */
export function useFetch(url, params = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const key = JSON.stringify(params);
  const seq = useRef(0);

  const load = useCallback(async () => {
    if (!url) return;
    const id = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const clean = Object.fromEntries(Object.entries(JSON.parse(key)).filter(([, v]) => v !== "" && v != null));
      const data = await unwrap(api.get(url, { params: clean }));
      if (id === seq.current) setState({ data, error: null, loading: false });
    } catch (err) {
      if (id === seq.current) setState((s) => ({ ...s, error: errorMessage(err), loading: false }));
    }
  }, [url, key]);

  useEffect(() => { load(); }, [load]);

  return { ...state, reload: load };
}
