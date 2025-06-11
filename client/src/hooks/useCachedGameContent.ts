import { useEffect, useState } from "react";
import axios from "axios";

export interface CachedResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export default function useCachedGameContent<T = any>(type: string): CachedResult<T> {
  const key = `gameContent_${type}`;
  const initialCache =
    typeof window !== "undefined" ? localStorage.getItem(key) : null;
  const [data, setData] = useState<T[]>(() => {
    if (initialCache) {
      try {
        return JSON.parse(initialCache);
      } catch {
        return [];
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
        setData(JSON.parse(cached));
        setLoading(false);
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
  }, [type]);

  return { data, loading, error };
}
