"use client";

import { useCallback, useEffect, useState } from "react";

import { api, apiErrorMessage } from "@/lib/api";
import { extractShortCode, type ShortUrl } from "@/lib/types";
import { toast } from "sonner";

/**
 * Loads the user's short URLs, then lazily hydrates per-link click counts
 * (the analytics endpoint 404s for links with zero clicks — treated as 0).
 */
export function useUrlsWithClicks() {
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [loadingUrls, setLoadingUrls] = useState(true);
  const [clicksByShortCode, setClicksByShortCode] = useState(
    new Map<string, number>(),
  );

  const fetchUrls = useCallback(async () => {
    try {
      const { data } = await api.get<{ urls?: ShortUrl[] }>("/urls");
      setUrls(data.urls ?? []);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not load your links"));
    } finally {
      setLoadingUrls(false);
    }
  }, []);

  useEffect(() => {
    void fetchUrls();
  }, [fetchUrls]);

  useEffect(() => {
    if (urls.length === 0) return;
    let cancelled = false;
    void Promise.allSettled(
      urls.map((url) =>
        api
          .get<{
            analytics: unknown[];
          }>(`/urls/analytics/${extractShortCode(url.shortUrl)}`)
          .then(({ data }) => ({
            code: extractShortCode(url.shortUrl),
            count: data.analytics.length,
          })),
      ),
    ).then((results) => {
      if (cancelled) return;
      setClicksByShortCode((prev) => {
        const next = new Map(prev);
        for (const result of results) {
          if (result.status === "fulfilled") {
            next.set(result.value.code, result.value.count);
          }
        }
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [urls]);

  return { urls, clicksByShortCode, loadingUrls, fetchUrls };
}
