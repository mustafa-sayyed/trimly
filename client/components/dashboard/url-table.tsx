"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  ExternalLink,
  LinkIcon,
  MoreHorizontal,
  Pencil,
  QrCode,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { copyToClipboard } from "@/lib/clipboard";
import {
  extractShortCode,
  formatDate,
  isExpired,
  type ShortUrl,
} from "@/lib/types";

export function UrlTable({
  urls,
  clicksByShortCode,
  loading,
  onEdit,
  onDelete,
  onQr,
}: {
  urls: ShortUrl[];
  clicksByShortCode: Map<string, number>;
  loading: boolean;
  onEdit: (url: ShortUrl) => void;
  onDelete: (url: ShortUrl) => void;
  onQr: (url: ShortUrl) => void;
}) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = async (shortUrl: string) => {
    const ok = await copyToClipboard(shortUrl);
    const code = extractShortCode(shortUrl);
    if (ok) {
      setCopiedCode(code);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopiedCode(null), 1500);
    } else {
      toast.error("Could not copy the link");
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Short link</TableHead>
          <TableHead className="text-right">Clicks</TableHead>
          <TableHead className="hidden md:table-cell">Destination</TableHead>
          <TableHead className="hidden lg:table-cell">Created</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {urls.map((url) => {
          const code = extractShortCode(url.shortUrl);
          const expired = isExpired(url);
          return (
            <TableRow key={url.id}>
              <TableCell className="max-w-48">
                <button
                  type="button"
                  onClick={() => handleCopy(url.shortUrl)}
                  title={url.shortUrl}
                  className="group flex max-w-full items-center gap-1.5 font-mono text-sm"
                >
                  <span className="truncate text-violet-300 group-hover:text-violet-200">
                    /{code}
                  </span>
                  <LinkIcon
                    className={`size-3.5 shrink-0 ${
                      copiedCode === code
                        ? "text-emerald-400"
                        : "text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    }`}
                  />
                </button>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {(clicksByShortCode.get(code) ?? 0).toLocaleString()}
              </TableCell>
              <TableCell className="hidden max-w-64 md:table-cell">
                <a
                  href={url.longUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <span className="truncate">{url.longUrl}</span>
                  <ExternalLink className="size-3 shrink-0" />
                </a>
              </TableCell>
              <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                {formatDate(url.createdAt)}
              </TableCell>
              <TableCell>
                {!url.expiresAt ? (
                  <Badge variant="secondary">Never</Badge>
                ) : expired ? (
                  <Badge variant="destructive">Expired</Badge>
                ) : (
                  <Badge className="bg-emerald-500/15 text-emerald-400">
                    {formatDate(url.expiresAt)}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Actions for ${code}`}
                    >
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => handleCopy(url.shortUrl)}>
                      Copy link
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a
                        href={url.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink /> Open
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/${code}`}>
                        <BarChart3 /> Analytics
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onQr(url)}>
                      <QrCode /> QR code
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(url)}>
                      <Pencil /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(url)}
                    >
                      <Trash2 /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
