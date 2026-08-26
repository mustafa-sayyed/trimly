import {
  BarChart3,
  CalendarClock,
  Link2,
  MousePointerClick,
  PenLine,
  Zap,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: PenLine,
    title: "Custom slugs",
    description:
      "Choose your own memorable short code instead of a random string — perfect for campaigns.",
  },
  {
    icon: CalendarClock,
    title: "Link expiry",
    description:
      "Set an expiration date so links automatically stop resolving when the campaign ends.",
  },
  {
    icon: BarChart3,
    title: "Click analytics",
    description:
      "See clicks over time, browsers, referrers and IP addresses for every short link.",
  },
  {
    icon: MousePointerClick,
    title: "One-click copy",
    description:
      "Copy any short link straight from your dashboard and share it in seconds.",
  },
  {
    icon: Zap,
    title: "Instant redirects",
    description:
      "Redis-cached lookups make every redirect blazing fast, no matter the traffic.",
  },
  {
    icon: Link2,
    title: "Everything in one place",
    description:
      "Manage, edit and delete all of your short links from a single clean dashboard.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything a short link should do
          </h2>
          <p className="mt-3 text-muted-foreground">
            Built for makers, marketers and teams who care about what happens
            after the click.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group border-border/60 bg-card/60 transition-colors hover:border-violet-500/40"
            >
              <CardContent className="flex flex-col gap-4 p-6">
                <span className="flex size-10 items-center justify-center rounded-lg border border-violet-500/25 bg-violet-500/10 text-violet-300 transition-transform group-hover:scale-105">
                  <feature.icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
