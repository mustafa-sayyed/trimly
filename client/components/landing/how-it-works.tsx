import Link from "next/link";
import { BarChart3, Link2, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Link2,
    step: "01",
    title: "Paste your link",
    description:
      "Drop any long, messy URL into Trimly and hit shorten. Custom slugs optional.",
  },
  {
    icon: Share2,
    step: "02",
    title: "Share it anywhere",
    description:
      "Copy your clean short link and use it in posts, emails, QR codes or bios.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Watch clicks roll in",
    description:
      "Every redirect is recorded — browsers, referrers, IPs — visualized in your dashboard.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            From long URL to insight in seconds
          </h2>
          <p className="mt-3 text-muted-foreground">
            Three steps. No configuration, no maintenance.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.step}
              className="relative rounded-2xl border border-border/60 bg-card/60 p-6"
            >
              <span className="absolute top-5 right-5 font-mono text-3xl font-semibold text-border">
                {step.step}
              </span>
              <span className="flex size-10 items-center justify-center rounded-lg border border-violet-500/25 bg-violet-500/10 text-violet-300">
                <step.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-medium">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section id="faq" className="scroll-mt-20 px-4 pb-24 sm:px-6">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-violet-500/25 bg-gradient-to-b from-violet-500/15 via-card to-card p-10 text-center sm:p-14">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to trim your first link?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Create a free account and start shortening, sharing and tracking in
          under a minute.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/signup">Create free account</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
