"use client";

import { Card, CardContent } from "@/components/ui/card";

export function BreakdownList({
  entries,
  emptyLabel,
}: {
  entries: { name: string; count: number }[];
  emptyLabel: string;
}) {
  const max = Math.max(...entries.map((e) => e.count), 1);
  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }
  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="space-y-4 p-5">
        {entries.map((entry) => (
          <div key={entry.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate font-medium">{entry.name}</span>
              <span className="ml-3 shrink-0 tabular-nums text-muted-foreground">
                {entry.count.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                style={{ width: `${Math.max((entry.count / max) * 100, 4)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
