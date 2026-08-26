"use client";

import { useCallback, useEffect } from "react";
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
import type { ShortUrl } from "@/lib/types";

const editSchema = z.object({
  longUrl: z.url("Enter a valid destination URL"),
  expiresAt: z.string().optional(),
});

type EditValues = z.infer<typeof editSchema>;

function toDateInputValue(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function EditUrlDialog({
  url,
  open,
  onOpenChange,
  onUpdated,
}: {
  url: ShortUrl | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}) {
  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { longUrl: "", expiresAt: "" },
  });

  useEffect(() => {
    if (open && url) {
      form.reset({
        longUrl: url.longUrl,
        expiresAt: toDateInputValue(url.expiresAt),
      });
    }
  }, [open, url, form]);

  const onSubmit = useCallback(
    async (values: EditValues) => {
      if (!url) return;
      try {
        // The update endpoint expects snake_case body keys.
        await api.patch(`/urls/${url.shortUrl.split("/").pop()}`, {
          long_url: values.longUrl,
          expires_at: values.expiresAt
            ? new Date(values.expiresAt).toISOString()
            : null,
        });
        toast.success("Short link updated");
        onUpdated();
        onOpenChange(false);
      } catch (error) {
        toast.error(apiErrorMessage(error, "Could not update the short link"));
      }
    },
    [url, onUpdated, onOpenChange],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit short link</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            /{url?.shortUrl.split("/").pop()}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.longUrl}>
              <FieldLabel htmlFor="edit-url">Destination URL</FieldLabel>
              <Input id="edit-url" {...form.register("longUrl")} />
              <FieldError errors={[form.formState.errors.longUrl]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-expiry">Expires on</FieldLabel>
              <Input
                id="edit-expiry"
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
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
