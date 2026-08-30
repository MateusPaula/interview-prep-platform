"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch, isApiError } from "./api-client";

interface ApiQueryState<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
  refetch: () => void;
}

export function useApiQuery<T>(path: string): ApiQueryState<T> {
  const router = useRouter();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    apiFetch<T>(path)
      .then((body) => {
        if (active) {
          setData(body);
          setIsLoading(false);
        }
      })
      .catch((failure: unknown) => {
        if (!active) {
          return;
        }
        const apiError = isApiError(failure)
          ? failure
          : new ApiError("internal_error", "Request failed");
        if (apiError.code === "unauthorized") {
          router.replace("/login");
          return;
        }
        setError(apiError);
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [path, attempt, router]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setAttempt((current) => current + 1);
  }, []);

  return { data, error, isLoading, refetch };
}
