"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Save, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogDescription,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogViewport,
} from "@/components/ui/dialog";
import type { HeaderManagedCategorySlug } from "@/lib/header-navigation-contracts";
import { cn } from "@/lib/utils";

export function HeaderVisibilityManager({
  category,
  title,
  isActive,
  disabled = false,
  onUpdated,
}: {
  category: HeaderManagedCategorySlug;
  title: string;
  isActive: boolean;
  disabled?: boolean;
  onUpdated: (isActive: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedActive, setSelectedActive] = useState(isActive);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setSelectedActive(isActive);
  }, [isActive]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      setSelectedActive(isActive);
    }
  }

  async function saveVisibility() {
    setPending(true);

    try {
      const response = await fetch(
        `/api/admin/management/${category}/header-visibility`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isHeaderActive: selectedActive }),
        },
      );
      const data = (await response.json()) as {
        isHeaderActive?: boolean;
        error?: string;
      };

      if (!response.ok || typeof data.isHeaderActive !== "boolean") {
        toast.error(data.error ?? "Unable to update header visibility.");
        return;
      }

      onUpdated(data.isHeaderActive);
      setOpen(false);
      toast.success(
        data.isHeaderActive
          ? `${title} is now visible in the header.`
          : `${title} is now hidden from the header.`,
      );
    } catch {
      toast.error("Unable to update header visibility.");
    } finally {
      setPending(false);
    }
  }

  const StatusIcon = isActive ? Eye : EyeOff;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        type="button"
        variant="outline"
        className="rounded-sm bg-transparent"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <StatusIcon className="size-4" />
        Header {isActive ? "Active" : "Inactive"}
      </Button>

      <DialogPortal>
        <DialogBackdrop />
        <DialogViewport>
          <DialogPopup className="max-w-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="font-serif text-3xl text-foreground">
                  Header Visibility
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  {title}
                </DialogDescription>
              </div>
              <DialogClose
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm border border-border bg-background text-foreground"
                aria-label="Close header visibility modal"
              >
                <X className="size-4" />
              </DialogClose>
            </div>

            <div className="mt-7 flex items-center justify-between gap-5 rounded-sm border border-border bg-background p-5">
              <div>
                <p className="font-medium text-foreground">
                  Visible in public header
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedActive ? "Active" : "Inactive"}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={selectedActive}
                aria-label={`Show ${title} in the public header`}
                onClick={() => setSelectedActive((current) => !current)}
                className={cn(
                  "relative h-7 w-12 shrink-0 rounded-full border transition-colors",
                  selectedActive
                    ? "border-primary bg-primary"
                    : "border-border bg-muted",
                )}
              >
                <span
                  className={cn(
                    "absolute left-1 top-1 size-[1.125rem] rounded-full bg-background shadow-sm transition-transform",
                    selectedActive ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </button>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <DialogClose
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-sm border border-border bg-background px-4 text-sm font-medium text-foreground hover:bg-muted"
              >
                Cancel
              </DialogClose>
              <Button
                type="button"
                className="rounded-sm"
                disabled={pending || selectedActive === isActive}
                onClick={() => void saveVisibility()}
              >
                <Save className="size-4" />
                Save Status
              </Button>
            </div>
          </DialogPopup>
        </DialogViewport>
      </DialogPortal>
    </Dialog>
  );
}
