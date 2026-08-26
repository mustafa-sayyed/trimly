"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { extractShortCode, type ShortUrl } from "@/lib/types";

export interface QrTarget {
  url: ShortUrl;
  simpleQrDataUrl: string;
  brandedQrDataUrl: string;
}

export function QrDialog({
  qrTarget,
  onOpenChange,
}: {
  qrTarget: QrTarget | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!qrTarget) return null;

  const code = extractShortCode(qrTarget.url.shortUrl);

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Trimly QR code</DialogTitle>
          <DialogDescription>Scan or download the QR Code</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center rounded-xl bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrTarget.simpleQrDataUrl}
            alt={`QR code linking to ${qrTarget.url.shortUrl}, with Trimly branding`}
            className="size-64 object-contain"
          />
        </div>
        <p className="truncate text-center font-mono text-xs text-muted-foreground">
          {qrTarget.url.shortUrl}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button asChild>
            <a href={qrTarget.brandedQrDataUrl} download={`trimly-${code}.png`}>
              <Download data-icon="inline-start" />
              Download PNG
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
