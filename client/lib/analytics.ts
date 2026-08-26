import type { ClickEvent } from "./types";

export const CHART_WINDOW_DAYS = 14;

export function bucketByDay(
  events: ClickEvent[],
  windowDays = CHART_WINDOW_DAYS,
): { day: string; clicks: number }[] {
  const buckets = new Map<string, number>();
  const today = new Date();
  for (let i = windowDays - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    buckets.set(date.toISOString().slice(0, 10), 0);
  }
  for (const event of events) {
    const key = new Date(event.clickAt).toISOString().slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }
  return [...buckets.entries()].map(([day, clicks]) => ({
    day: new Date(`${day}T00:00:00Z`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    clicks,
  }));
}

export function topEntries(
  events: ClickEvent[],
  pick: (event: ClickEvent) => string | null,
): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const event of events) {
    const raw = pick(event);
    let name = "Unknown";
    if (raw) {
      try {
        name = new URL(raw).hostname;
      } catch {
        name = raw;
      }
    }
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function uniqueIpCount(events: ClickEvent[]): number {
  return new Set(
    events.map((e) => e.ipAddress).filter((ip): ip is string => !!ip),
  ).size;
}
