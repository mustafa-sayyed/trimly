"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Activity, Flame, MousePointerClick, UserRound } from "lucide-react";

import { BreakdownList } from "@/components/dashboard/breakdown-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUrlsWithClicks } from "@/hooks/use-urls-with-clicks";
import {
  bucketByDay,
  CHART_WINDOW_DAYS,
  topEntries,
  uniqueIpCount,
} from "@/lib/analytics";
import { api } from "@/lib/api";
import { extractShortCode, type ClickEvent } from "@/lib/types";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

const chartConfig = {
  clicks: { label: "Clicks", color: "var(--chart-1)" },
} satisfies ChartConfig;

const LEADERBOARD_SIZE = 5;

export default function GlobalAnalyticsPage() {
  const { urls, loadingUrls } = useUrlsWithClicks();
  const [eventsByCode, setEventsByCode] = useState(
    new Map<string, ClickEvent[]>(),
  );

  useEffect(() => {
    if (urls.length === 0) return;
    let cancelled = false;
    void Promise.allSettled(
      urls.map((url) =>
        api
          .get<{
            analytics: ClickEvent[];
          }>(`/urls/analytics/${extractShortCode(url.shortUrl)}`)
          .then(({ data }) => ({
            code: extractShortCode(url.shortUrl),
            events: data.analytics,
          })),
      ),
    ).then((results) => {
      if (cancelled) return;
      const next = new Map<string, ClickEvent[]>();
      for (const result of results) {
        if (result.status === "fulfilled") {
          next.set(result.value.code, result.value.events);
        }
      }
      setEventsByCode(next);
    });
    return () => {
      cancelled = true;
    };
  }, [urls]);

  const allEvents = useMemo(
    () => [...eventsByCode.values()].flat(),
    [eventsByCode],
  );

  const daily = useMemo(() => bucketByDay(allEvents), [allEvents]);

  const browsers = useMemo(
    () => topEntries(allEvents, (e) => e.userAgent),
    [allEvents],
  );

  const referrers = useMemo(
    () =>
      topEntries(allEvents, (e) => e.referrer ?? "").map((entry) =>
        entry.name === "" ? { ...entry, name: "Direct" } : entry,
      ),
    [allEvents],
  );

  const leaderboard = useMemo(
    () =>
      [...urls]
        .map((url) => ({
          url,
          clicks: eventsByCode.get(extractShortCode(url.shortUrl))?.length ?? 0,
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, LEADERBOARD_SIZE),
    [urls, eventsByCode],
  );

  const totalClicks = allEvents.length;
  const linksWithClicks = [...eventsByCode.values()].filter(
    (events) => events.length > 0,
  ).length;
  const avgClicks = urls.length > 0 ? totalClicks / urls.length : 0;

  const stats = [
    {
      label: "Total clicks",
      value: totalClicks.toLocaleString(),
      icon: MousePointerClick,
    },
    {
      label: "Unique IPs",
      value: uniqueIpCount(allEvents).toLocaleString(),
      icon: UserRound,
    },
    {
      label: "Links with clicks",
      value: `${linksWithClicks}/${urls.length}`,
      icon: Activity,
    },
    { label: "Avg clicks / link", value: avgClicks.toFixed(1), icon: Flame },
  ];

  if (!loadingUrls && urls.length === 0) {
    return (
      <Empty className="rounded-2xl border border-border/60">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Activity />
          </EmptyMedia>
          <EmptyTitle>No links yet</EmptyTitle>
          <EmptyDescription>
            Create your first short link to start collecting click insights.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/dashboard">Go to overview</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Combined click insights across every link you own.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/60 bg-card/60">
            <CardContent className="p-4 sm:p-5">
              <span className="flex size-9 items-center justify-center rounded-lg border border-violet-500/25 bg-violet-500/10 text-violet-300">
                <stat.icon className="size-4.5" />
              </span>
              <p className="mt-3 truncate text-xs text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-0.5 truncate text-xl font-semibold tabular-nums sm:text-2xl">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle>All clicks — last {CHART_WINDOW_DAYS} days</CardTitle>
          <CardDescription>
            Daily click volume across all of your short links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUrls || urls.length !== eventsByCode.size ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner className="size-6 text-violet-400" />
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <AreaChart data={daily} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={28}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Area
                  dataKey="clicks"
                  type="monotone"
                  fill="var(--color-clicks)"
                  fillOpacity={0.25}
                  stroke="var(--color-clicks)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle>Top performing links</CardTitle>
          <CardDescription>
            Your best links ranked by lifetime clicks.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loadingUrls ? (
            <div className="flex justify-center py-8">
              <Spinner className="size-6 text-violet-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Short link</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Destination
                  </TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry, index) => {
                  const code = extractShortCode(entry.url.shortUrl);
                  return (
                    <TableRow key={entry.url.id}>
                      <TableCell>
                        <Badge
                          variant={index < 3 ? "default" : "secondary"}
                          className="tabular-nums"
                        >
                          {index + 1}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/${code}`}
                          className="font-mono text-sm text-violet-300 hover:text-violet-200"
                        >
                          /{code}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden max-w-64 truncate text-sm text-muted-foreground md:table-cell">
                        {entry.url.longUrl}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {entry.clicks.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="browsers">
        <TabsList>
          <TabsTrigger value="browsers">Browsers</TabsTrigger>
          <TabsTrigger value="referrers">Referrers</TabsTrigger>
        </TabsList>
        <TabsContent value="browsers">
          <BreakdownList entries={browsers} emptyLabel="No browser data yet." />
        </TabsContent>
        <TabsContent value="referrers">
          <BreakdownList
            entries={referrers}
            emptyLabel="No referrer data yet."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
