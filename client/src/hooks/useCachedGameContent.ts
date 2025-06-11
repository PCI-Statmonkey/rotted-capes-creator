import { useEffect, useState } from "react";
import axios from "axios";

export interface CachedResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export default function useCachedGameContent<T = any>(
  type: string,
  validate?: (data: T[]) => boolean
): CachedResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const key = `gameContent_${type}`;
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
