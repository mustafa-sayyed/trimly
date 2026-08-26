"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Scissors, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Hero() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  return (
    <section className="relative overflow-hidden px-4 pt-36 pb-20 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[480px] max-w-3xl rounded-full bg-violet-600/25 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-24 right-[10%] size-72 rounded-full bg-indigo-500/15 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)] opacity-40"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 py-1 pr-3 pl-1 text-xs font-medium text-violet-300">
          <span className="flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5">
            <Sparkles className="size-3" /> New
          </span>
          Click analytics on every link
        </div>

        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          Shorten links.{" "}
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
            Track every click.
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-lg text-muted-foreground text-balance">
          Trimly turns long URLs into clean, memorable short links with custom
          slugs, expiry dates and real-time click analytics.
        </p>

        <form
          className="mt-9 w-full max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(
              url ? `/signup?url=${encodeURIComponent(url)}` : "/signup",
            );
          }}
        >
          <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-card/80 p-2 shadow-2xl shadow-violet-950/30 backdrop-blur">
            <Scissors className="ml-3 hidden size-4 shrink-0 text-muted-foreground sm:block" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste your long URL..."
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button type="submit" size="lg" className="shrink-0">
              Shorten now
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Free forever · No credit card required
          </p>
        </form>
      </div>
    </section>
  );
}
