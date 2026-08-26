"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownWideNarrow,
  Clock,
  Link2,
  MousePointerClick,
  Plus,
  Search,
  Unlink,
} from "lucide-react";
import { toast } from "sonner";

import { CreateUrlDialog } from "@/components/dashboard/create-url-dialog";
import { EditUrlDialog } from "@/components/dashboard/edit-url-dialog";
import { QrDialog, type QrTarget } from "@/components/dashboard/qr-dialog";
import { UrlTable } from "@/components/dashboard/url-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, apiErrorMessage } from "@/lib/api";
import { useUrlsWithClicks } from "@/hooks/use-urls-with-clicks";
import { generateBrandedQr } from "@/lib/qrcode";
import { extractShortCode, isExpired, type ShortUrl } from "@/lib/types";

type StatusFilter = "all" | "active" | "expired" | "never";
type SortKey = "newest" | "oldest" | "clicks-desc" | "clicks-asc";

interface StatCard {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function DashboardPage() {
  const { urls, clicksByShortCode, loadingUrls, fetchUrls } =
    useUrlsWithClicks();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("newest");

  const [createOpen, setCreateOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("");
  const [editTarget, setEditTarget] = useState<ShortUrl | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShortUrl | null>(null);
  const [qrTarget, setQrTarget] = useState<QrTarget | null>(null);

  // Reopen the create dialog with a URL captured on the landing page.
  useEffect(() => {
    if (loadingUrls) return;
    void Promise.resolve().then(() => {
      const pending = window.sessionStorage.getItem("trimly.pendingUrl");
      if (!pending) return;
      window.sessionStorage.removeItem("trimly.pendingUrl");
      setPendingUrl(pending);
      setCreateOpen(true);
    });
  }, [loadingUrls]);

  const openCreateDialog = useCallback(() => {
    const pending = window.sessionStorage.getItem("trimly.pendingUrl");
    if (pending) {
      window.sessionStorage.removeItem("trimly.pendingUrl");
      setPendingUrl(pending);
    }
    setCreateOpen(true);
  }, []);

  const handleQr = useCallback(async (url: ShortUrl) => {
    try {
      const dataUrl = await generateBrandedQr(url.shortUrl);
      setQrTarget({
        url,
        simpleQrDataUrl: dataUrl.simpleQr,
        brandedQrDataUrl: dataUrl.brandedQr,
      });
    } catch {
      toast.error("Could not generate the QR code");
    }
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/urls/${extractShortCode(deleteTarget.shortUrl)}`);
      toast.success("Short link deleted");
      await fetchUrls();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not delete the short link"));
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, fetchUrls]);

  const visibleUrls = useMemo(() => {
    const query = search.trim().toLowerCase();
    let result = urls.filter((url) => {
      if (
        query &&
        !url.longUrl.toLowerCase().includes(query) &&
        !extractShortCode(url.shortUrl).toLowerCase().includes(query)
      ) {
        return false;
      }
      switch (statusFilter) {
        case "active":
          return !isExpired(url);
        case "expired":
          return isExpired(url);
        case "never":
          return url.expiresAt === null;
        default:
          return true;
      }
    });
    const clicksOf = (url: ShortUrl) =>
      clicksByShortCode.get(extractShortCode(url.shortUrl)) ?? 0;
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return a.createdAt.localeCompare(b.createdAt);
        case "clicks-desc":
          return clicksOf(b) - clicksOf(a);
        case "clicks-asc":
          return clicksOf(a) - clicksOf(b);
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });
    return result;
  }, [urls, search, statusFilter, sortBy, clicksByShortCode]);

  const stats = useMemo<StatCard[]>(() => {
    const totalClicks = [...clicksByShortCode.values()].reduce(
      (sum, count) => sum + count,
      0,
    );
    const active = urls.filter((url) => !isExpired(url)).length;
    return [
      {
        label: "Total links",
        value: urls.length.toLocaleString(),
        icon: Link2,
      },
      {
        label: "Total clicks",
        value: totalClicks.toLocaleString(),
        icon: MousePointerClick,
      },
      { label: "Active", value: active.toLocaleString(), icon: Clock },
      {
        label: "Expired",
        value: (urls.length - active).toLocaleString(),
        icon: Unlink,
      },
    ];
  }, [urls, clicksByShortCode]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your short links and watch the clicks roll in.
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus data-icon="inline-start" />
          New short link
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/60 bg-card/60">
            <CardContent className="flex items-center gap-4 p-4 sm:p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-violet-500/25 bg-violet-500/10 text-violet-300">
                <stat.icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-xl font-semibold tabular-nums sm:text-2xl">
                  {loadingUrls ? "—" : stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Your short links</CardTitle>
              <CardDescription>
                {!loadingUrls && urls.length > 0
                  ? `${visibleUrls.length} of ${urls.length} shown.`
                  : "No links yet."}
              </CardDescription>
            </div>
            {!loadingUrls && urls.length > 0 && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search links..."
                    className="pl-8 sm:w-56"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as StatusFilter)
                  }
                >
                  <SelectTrigger
                    className="sm:w-36"
                    aria-label="Filter by status"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="never">Never expires</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as SortKey)}
                >
                  <SelectTrigger className="sm:w-40" aria-label="Sort links">
                    <ArrowDownWideNarrow />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                    <SelectItem value="clicks-desc">Most clicks</SelectItem>
                    <SelectItem value="clicks-asc">Least clicks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {!loadingUrls && urls.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Link2 />
                </EmptyMedia>
                <EmptyTitle>No short links yet</EmptyTitle>
                <EmptyDescription>
                  Create your first short link to start tracking clicks.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={openCreateDialog}>
                  <Plus data-icon="inline-start" />
                  Create short link
                </Button>
              </EmptyContent>
            </Empty>
          ) : !loadingUrls && visibleUrls.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Search />
                </EmptyMedia>
                <EmptyTitle>No matches</EmptyTitle>
                <EmptyDescription>
                  Try a different search term or clear the filters.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="min-w-[640px]">
              <UrlTable
                urls={visibleUrls}
                clicksByShortCode={clicksByShortCode}
                loading={loadingUrls}
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
                onQr={(url) => void handleQr(url)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <CreateUrlDialog
        key={createOpen ? "create-open" : "create-closed"}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => void fetchUrls()}
        initialUrl={pendingUrl}
      />

      <EditUrlDialog
        url={editTarget}
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        onUpdated={() => void fetchUrls()}
      />

      <QrDialog qrTarget={qrTarget} onOpenChange={() => setQrTarget(null)} />

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this short link?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes{" "}
              <span className="font-mono text-foreground">
                /{deleteTarget ? extractShortCode(deleteTarget.shortUrl) : ""}
              </span>{" "}
              and all of its analytics. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
