"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, initializing, login } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const pendingUrl = searchParams.get("url");

  useEffect(() => {
    if (pendingUrl) {
      window.sessionStorage.setItem("trimly.pendingUrl", pendingUrl);
    }
  }, [pendingUrl]);

  useEffect(() => {
    if (!initializing && user) {
      router.replace("/dashboard");
    }
  }, [initializing, user, router]);

  const onSubmit = useCallback(
    async (values: LoginFormValues) => {
      try {
        await login(values.email, values.password);
        toast.success("Welcome back!");
        router.replace("/dashboard");
      } catch (error) {
        toast.error(apiErrorMessage(error, "Could not sign you in"));
      }
    },
    [login, router],
  );

  return (
    <AuthShell
      title="Sign in to Trimly"
      subtitle="Enter your credentials to access your dashboard."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-violet-400 hover:text-violet-300"
          >
            Create one free
          </Link>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Field data-invalid={!!form.formState.errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...form.register("email")}
            />
            <FieldError errors={[form.formState.errors.email]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.password}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...form.register("password")}
            />
            <FieldError errors={[form.formState.errors.password]} />
          </Field>
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && <Spinner />}
            Sign in
          </Button>
        </FieldGroup>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
