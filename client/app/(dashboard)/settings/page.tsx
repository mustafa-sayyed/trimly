"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { LogOut, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function SettingsPage() {
  const { user, logout, deleteAccount } = useAuth();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace("/login");
  }, [logout, router]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteAccount();
      toast.success("Your account has been deleted");
      router.replace("/");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not delete your account"));
    }
  }, [deleteAccount, router]);

  if (!user) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and session.
        </p>
      </div>

      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-lg text-white">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{user.name}</p>
              <Badge variant="secondary">ID #{user.id}</Badge>
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>
            Sign out of Trimly on this device. Your links stay live.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut data-icon="inline-start" />
            Sign out
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40 bg-destructive/[0.03]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="size-5 text-destructive" />
            Danger zone
          </CardTitle>
          <CardDescription>
            Deleting your account permanently removes it along with every short
            link you own.
          </CardDescription>
        </CardHeader>
        <Separator className="bg-destructive/20" />
        <CardContent className="pt-5">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes{" "}
                  <span className="text-foreground">{user.email}</span>, all of
                  your short links and their analytics. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Yes, delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
