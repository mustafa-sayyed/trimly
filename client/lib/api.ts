import axios, { type InternalAxiosRequestConfig } from "axios";

import type { AuthTokens } from "./types";

const TOKENS_KEY = "trimly.auth";
const USER_KEY = "trimly.user";

export function getTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(TOKENS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
}

export function setTokens(tokens: AuthTokens): void {
  window.localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

export function clearAuth(): void {
  window.localStorage.removeItem(TOKENS_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const tokens = getTokens();
  if (tokens) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

let refreshPromise: Promise<AuthTokens> | null = null;

async function requestRefreshToken(refreshToken: string): Promise<AuthTokens> {
  const { data } = await axios.post<{
    accessToken: string;
    refreshToken: string;
  }>(`${process.env.NEXT_PUBLIC_API_URL}/users/access-token`, { refreshToken });
  return { accessToken: data.accessToken, refreshToken: data.refreshToken };
}

function forceSignOut() {
  clearAuth();
  if (typeof window !== "undefined") {
    // Interceptors run outside React; router-based navigation isn't available.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`${window.location.origin}/login`);
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as RetriableConfig | undefined;
    const status: number | undefined = error.response?.status;
    const url: string | undefined = original?.url;

    const isAuthEndpoint =
      url?.includes("/users/access-token") ||
      url?.includes("/users/login") ||
      url?.includes("/users/register");

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint &&
      getTokens()
    ) {
      original._retry = true;
      try {
        refreshPromise ??= requestRefreshToken(
          getTokens()!.refreshToken,
        ).finally(() => {
          refreshPromise = null;
        });
        const fresh = await refreshPromise;
        setTokens(fresh);
        original.headers.Authorization = `Bearer ${fresh.accessToken}`;
        return api(original);
      } catch {
        forceSignOut();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? fallback;
  }
  return fallback;
}
