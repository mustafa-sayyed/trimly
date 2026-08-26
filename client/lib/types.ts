export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ShortUrl {
  id: number;
  longUrl: string;
  shortUrl: string;
  expiresAt: string | null;
  createdAt: string;
}

export interface ClickEvent {
  clickAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
}

export function extractShortCode(shortUrl: string): string {
  return shortUrl.split("/").pop() ?? "";
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isExpired(url: ShortUrl): boolean {
  return url.expiresAt !== null && new Date(url.expiresAt) < new Date();
}
