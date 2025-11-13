import { useCallback, useEffect, useState } from "react";
import { getReviewMetrics, type ReviewMetrics } from "../../index-db";

interface UseReviewMetricsResult {
  metrics: ReviewMetrics | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useReviewMetrics = (): UseReviewMetricsResult => {
  const [metrics, setMetrics] = useState<ReviewMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getReviewMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load metrics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    metrics,
    isLoading,
    error,
    refresh,
  };
};
