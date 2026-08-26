import Link from "next/link";
import { Link2 } from "lucide-react";

import { Separator } from "@/components/ui/separator";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
            <Link2 className="size-3.5 text-white" />
          </span>
          <span className="font-semibold tracking-tight">Trimly</span>
        </Link>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Trimly. Short links, sharper insights.
        </p>
        <Separator className="sm:hidden" />
      </div>
    </footer>
  );
}
