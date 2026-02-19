import { useState, useEffect, useRef } from "react";
import { AISummaryService } from "../services/aiSummary";

const service = new AISummaryService();

export function useAISummary(
  type: "commit" | "pr" | null,
  repository: string,
  identifier: string
): { summary: string | null; loading: boolean } {
  // Initialize from cache synchronously to avoid loading flash
  const [summary, setSummary] = useState<string | null>(() => {
    if (!type) return null;
    return service.getCached(type, repository, identifier);
  });
  const [loading, setLoading] = useState(() => {
    if (!type) return false;
    return !service.getCached(type, repository, identifier);
  });
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!type || fetchedRef.current) return;

    // Already cached — no need to fetch
    const cached = service.getCached(type, repository, identifier);
    if (cached) {
      setSummary(cached);
      setLoading(false);
      return;
    }

    fetchedRef.current = true;

    service.getSummary(type, repository, identifier).then((result) => {
      setSummary(result);
      setLoading(false);
    });
  }, [type, repository, identifier]);

  return { summary, loading };
}
