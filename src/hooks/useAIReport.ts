import { useState, useEffect, useCallback } from "react";
import { ActivityItem } from "../types";
import { AIReport } from "../types/team";
import { getCachedReport, generateReport } from "../services/aiReport";

export const useAIReport = (
  type: "standup" | "rollup",
  activities: ActivityItem[],
  enabled: boolean
) => {
  const [report, setReport] = useState<AIReport | null>(() =>
    getCachedReport(type)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    if (activities.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateReport(type, activities);
      setReport(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate report"
      );
    } finally {
      setLoading(false);
    }
  }, [type, activities]);

  // Auto-generate when tab is active and no cached report
  useEffect(() => {
    if (enabled && !report && activities.length > 0 && !loading) {
      generate();
    }
  }, [enabled, report, activities.length, loading, generate]);

  const regenerate = useCallback(async () => {
    setReport(null);
    await generate();
  }, [generate]);

  return { report, loading, error, regenerate };
};
