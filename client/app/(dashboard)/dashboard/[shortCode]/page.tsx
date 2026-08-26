"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Globe,
  LinkIcon,
  MousePointerClick,
  Monitor,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BreakdownList } from "@/components/dashboard/breakdown-list";
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
import { copyToClipboard } from "@/lib/clipboard";
import { api } from "@/lib/api";
import {
  bucketByDay,
  CHART_WINDOW_DAYS as WINDOW_DAYS,
  topEntries,
  uniqueIpCount,
} from "@/lib/analytics";
import { formatDateTime, type ClickEvent, type ShortUrl } from "@/lib/types";

const chartConfig = {
  clicks: { label: "Clicks", color: "var(--chart-1)" },
} satisfies ChartConfig;

export default function AnalyticsPage() {
  const params = useParams<{ shortCode: string }>();
  const router = useRouter();
  const shortCode = params.shortCode;

  const [urlDetails, setUrlDetails] = useState<ShortUrl | null>(null);
  const [events, setEvents] = useState<ClickEvent[] | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve()
      .then(() => {
        if (cancelled) return;
        setLoading(true);
        setNotFound(false);
        return Promise.allSettled([
          api.get<{ url: ShortUrl }>(`/urls/code/${shortCode}`),
          api.get<{ analytics: ClickEvent[] }>(`/urls/analytics/${shortCode}`),
        ]).then(([detailsResult, analyticsResult]) => {
          if (cancelled) return;
          const detailsMissing =
            detailsResult.status === "rejected" &&
            axios.isAxiosError(detailsResult.reason) &&
            detailsResult.reason.response?.status === 404;
          if (detailsMissing) {
            setNotFound(true);
          } else if (detailsResult.status === "fulfilled") {
            setUrlDetails(detailsResult.value.data.url);
          }
          if (analyticsResult.status === "fulfilled") {
            setEvents(analyticsResult.value.data.analytics);
          }
          setLoading(false);
        });
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shortCode]);

  const daily = useMemo(() => (events ? bucketByDay(events) : []), [events]);

  const browsers = useMemo(
    () => (events ? topEntries(events, (e) => e.userAgent) : []),
    [events],
  );

  const referrers = useMemo(
    () =>
      events
        ? topEntries(events, (e) => e.referrer ?? "").map((entry) =>
            entry.name === "" ? { ...entry, name: "Direct" } : entry,
          )
        : [],
    [events],
  );

  const uniqueIps = useMemo(
    () => (events ? uniqueIpCount(events) : 0),
    [events],
  );

  if (notFound) {
    return (
      <Empty className="border border-border/60 rounded-2xl">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LinkIcon />
          </EmptyMedia>
          <EmptyTitle>Short link not found</EmptyTitle>
          <EmptyDescription>
            It may have been deleted or belongs to another account.
          </EmptyDescription>
        </EmptyHeader>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          <ArrowLeft data-icon="inline-start" />
          Back to overview
        </Button>
      </Empty>
    );
  }

  if (loading || !events) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner className="size-6 text-violet-400" />
      </div>
    );
  }

  const shortUrl = urlDetails?.shortUrl ?? `/${shortCode}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Back to overview"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft />
        </Button>
        <h1 className="font-mono text-xl font-semibold tracking-tight">
          /{shortCode}
        </h1>
        <Badge variant="secondary" className="tabular-nums">
          {events.length.toLocaleString()} clicks
        </Badge>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const ok = await copyToClipboard(shortUrl);
              if (ok) {
                toast.success("Link copied to clipboard");
              } else {
                toast.error("Could not copy the link");
              }
            }}
          >
            <Copy data-icon="inline-start" />
            Copy
          </Button>
          <Button size="sm" asChild>
            <a href={shortUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink data-icon="inline-start" />
              Open
            </a>
          </Button>
        </div>
      </div>

      {urlDetails && (
        <Card className="border-border/60 bg-card/60">
          <CardContent className="flex items-center gap-3 p-4 text-sm">
            <Globe className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-muted-foreground">
              {urlDetails.longUrl}
            </span>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[
          {
            label: "Total clicks",
            value: events.length.toLocaleString(),
            icon: MousePointerClick,
          },
          {
            label: "Unique IPs",
            value: uniqueIps.toLocaleString(),
            icon: UserRound,
          },
          { label: "Browsers", value: String(browsers.length), icon: Monitor },
          {
            label: "Top referrer",
            value: referrers[0]?.name ?? "Direct",
            icon: Globe,
          },
        ].map((stat) => (
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
          <CardTitle>Clicks — last {WINDOW_DAYS} days</CardTitle>
          <CardDescription>Daily click volume for this link.</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Tabs defaultValue="browsers">
        <TabsList>
          <TabsTrigger value="browsers">Browsers</TabsTrigger>
          <TabsTrigger value="referrers">Referrers</TabsTrigger>
          <TabsTrigger value="recent">Recent clicks</TabsTrigger>
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
        <TabsContent value="recent">
          <Card className="border-border/60 bg-card/60 py-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Browser</TableHead>
                  <TableHead>IP address</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Referrer
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.slice(0, 20).map((event, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDateTime(event.clickAt)}</TableCell>
                    <TableCell>{event.userAgent ?? "Unknown"}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {event.ipAddress ?? "—"}
                    </TableCell>
                    <TableCell className="hidden max-w-48 truncate sm:table-cell">
                      {event.referrer ?? "Direct"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
