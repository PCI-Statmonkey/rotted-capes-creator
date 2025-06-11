import { useEffect, useState } from "react";
import axios from "axios";

export interface CachedResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

/**
 * Retrieve game content from `/api/game-content/{type}` while caching results
 * in localStorage. If a validation callback is provided, cached data that fails
 * the check will be ignored and replaced by a fresh request.
 */
export default function useCachedGameContent<T = any>(
  type: string,
  validate?: (data: T[]) => boolean
): CachedResult<T> {
  const key = `gameContent_${type}`;
  const initialCache =
    typeof window !== "undefined" ? localStorage.getItem(key) : null;
  const [data, setData] = useState<T[]>(() => {
    if (initialCache) {
      try {
        const parsed = JSON.parse(initialCache);
        if (!validate || validate(parsed)) {
          return parsed;
        }
      } catch {
        // ignore parse errors
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(!initialCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (!validate || validate(parsed)) {
          setData(parsed);
          setLoading(false);
        }
      } catch {
        // ignore parse errors
      }
    }

    axios
      .get(`/api/game-content/${type}`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setData(res.data);
          localStorage.setItem(key, JSON.stringify(res.data));
        } else {
          setError("Invalid data");
        }
      })
      .catch((e: any) => {
        console.error(`Failed to fetch ${type}:`, e);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [type, validate]);

  return { data, loading, error };
}
