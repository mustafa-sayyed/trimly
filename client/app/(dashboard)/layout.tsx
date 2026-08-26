"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  Settings,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, initializing, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!initializing && !user) {
      router.replace("/login");
    }
  }, [initializing, user, router]);

  if (initializing || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-6 text-violet-400" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const go = (href: string) => {
    setMobileNavOpen(false);
    router.push(href);
  };

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <div className="min-h-screen">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/60 bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border/60 px-5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
            <Link2 className="size-4 text-white" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Trimly</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive(item.href)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[active=true]:bg-accent data-[active=true]:font-medium data-[active=true]:text-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border/60 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3"
              >
                <Avatar className="size-7">
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-xs text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-sm">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span>{user.name}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user.email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                <LogOut /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu />
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
              <Link2 className="size-3.5 text-white" />
            </span>
            <span className="font-semibold tracking-tight">Trimly</span>
          </Link>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Account menu">
              <Avatar className="size-7">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-xs text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span>{user.name}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {user.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Mobile navigation drawer */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="h-16 justify-center border-b border-border/60 px-5">
            <SheetTitle className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25">
                <Link2 className="size-4 text-white" />
              </span>
              Trimly
            </SheetTitle>
            <SheetDescription className="sr-only">
              Main navigation
            </SheetDescription>
          </SheetHeader>
          <nav className="space-y-1 p-3">
            {navItems.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={() => go(item.href)}
                data-active={isActive(item.href)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[active=true]:bg-accent data-[active=true]:font-medium data-[active=true]:text-foreground"
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            ))}
            <div className="my-3 border-t border-border/60" />
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </nav>
        </SheetContent>
      </Sheet>

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
