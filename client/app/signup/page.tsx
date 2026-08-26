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

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, initializing, register: registerAccount } = useAuth();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
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
    async (values: SignupFormValues) => {
      try {
        await registerAccount(values.name, values.email, values.password);
        toast.success("Account created — sign in to continue");
        router.replace(
          pendingUrl
            ? `/login?url=${encodeURIComponent(pendingUrl)}`
            : "/login",
        );
      } catch (error) {
        toast.error(apiErrorMessage(error, "Could not create your account"));
      }
    },
    [registerAccount, router, pendingUrl],
  );

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free forever. Start shortening links in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-violet-400 hover:text-violet-300"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              placeholder="Jane Doe"
              autoComplete="name"
              {...form.register("name")}
            />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>
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
              placeholder="At least 8 characters"
              autoComplete="new-password"
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
            Create account
          </Button>
        </FieldGroup>
      </form>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
