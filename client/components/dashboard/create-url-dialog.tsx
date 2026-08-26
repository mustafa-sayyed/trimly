"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api, apiErrorMessage } from "@/lib/api";

const shortCodeField = z
  .string()
  .trim()
  .max(50, "Short code is too long")
  .regex(/^[a-zA-Z0-9_-]*$/, "Only letters, numbers, hyphens and underscores");

const createSchema = z.object({
  url: z.url("Enter a valid destination URL"),
  customShortCode: shortCodeField.optional(),
  expiresAt: z.string().optional(),
});

type CreateValues = z.infer<typeof createSchema>;

export function CreateUrlDialog({
  open,
  onOpenChange,
  onCreated,
  initialUrl = "",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  initialUrl?: string;
}) {
  // `key` on the consumer remounts this dialog for every open, so defaults
  // (including a URL captured on the landing page) are picked up fresh.
  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { url: initialUrl, customShortCode: "", expiresAt: "" },
  });

  const onSubmit = useCallback(
    async (values: CreateValues) => {
      try {
        await api.post("/urls", {
          url: values.url,
          ...(values.customShortCode
            ? { customShortCode: values.customShortCode }
            : {}),
          ...(values.expiresAt
            ? { expiresAt: new Date(values.expiresAt).toISOString() }
            : {}),
        });
        toast.success("Short link created");
        onCreated();
        onOpenChange(false);
      } catch (error) {
        toast.error(apiErrorMessage(error, "Could not create the short link"));
      }
    },
    [onCreated, onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a short link</DialogTitle>
          <DialogDescription>
            Customize the slug and set an optional expiry date.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.url}>
              <FieldLabel htmlFor="create-url">Destination URL</FieldLabel>
              <Input
                id="create-url"
                placeholder="https://example.com/very/long/path"
                {...form.register("url")}
              />
              <FieldError errors={[form.formState.errors.url]} />
            </Field>
            <Field data-invalid={!!form.formState.errors.customShortCode}>
              <FieldLabel htmlFor="create-code">
                Custom slug{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FieldLabel>
              <Input
                id="create-code"
                placeholder="my-launch-2026"
                {...form.register("customShortCode")}
              />
              <FieldError errors={[form.formState.errors.customShortCode]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="create-expiry">
                Expires on{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </FieldLabel>
              <Input
                id="create-expiry"
                type="date"
                {...form.register("expiresAt")}
              />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Spinner />}
              Create link
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
