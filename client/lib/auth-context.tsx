"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api, clearAuth, getTokens, setTokens } from "@/lib/api";
import type { AuthTokens, User } from "@/lib/types";

const USER_KEY = "trimly.user";

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function cacheUser(user: User | null): void {
  if (user) {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(USER_KEY);
  }
}

function readCachedUser(): User | null {
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Defer to a microtask so localStorage reads never race hydration.
    void Promise.resolve().then(() => {
      const tokens = getTokens();
      if (!tokens) {
        if (!cancelled) setInitializing(false);
        return;
      }
      if (!cancelled) setUser(readCachedUser());
      api
        .get<{ user: User }>("/users/me")
        .then(({ data }) => {
          if (!cancelled) {
            setUser(data.user);
            cacheUser(data.user);
          }
        })
        .catch(() => {
          // 401 is handled by the refresh interceptor; anything else keeps the
          // cached user so the dashboard still renders.
        })
        .finally(() => {
          if (!cancelled) setInitializing(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>("/users/login", { email, password });
    const tokens: AuthTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
    setTokens(tokens);
    cacheUser(data.user);
    setUser(data.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await api.post("/users/register", { name, email, password });
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/users/logout");
    } catch {
      // Token may already be invalid; clear locally regardless.
    }
    clearAuth();
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    await api.delete("/users/me");
    clearAuth();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, initializing, login, register, logout, deleteAccount }),
    [user, initializing, login, register, logout, deleteAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
