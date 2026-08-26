import Link from "next/link";
import { Link2 } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[420px] max-w-2xl rounded-full bg-violet-600/20 blur-[140px]"
      />
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
            <Link2 className="size-4 text-white" />
          </span>
          <span className="text-xl font-semibold tracking-tight">Trimly</span>
        </Link>
        <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-2xl shadow-violet-950/20 backdrop-blur sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {footer}
        </p>
      </div>
    </div>
  );
}
