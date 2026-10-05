"use client";

import { AdminPanel } from "@/components/admin/AdminPanel";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

import { Eye, EyeOff, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  HEADER_MANAGED_CATEGORIES,
  type HeaderManagedCategorySlug,
  type HeaderNavigationVisibility,
} from "@/lib/header-navigation-contracts";
import { cn } from "@/lib/utils";

const navigationLabels: Record<HeaderManagedCategorySlug, string> = {
  "add-ons": "Add-ons",
  drinks: "Drinks",
  "student-meal": "Student Meals",
  promo: "Promotions",
  "meal-of-the-day": "Meal of the Day",
  "best-seller": "Best Sellers",
  "bilao-tray": "Bilao Trays",
};

export function HeaderNavigationManager() {
  const [visibility, setVisibility] =
    useState<HeaderNavigationVisibility | null>(null);
  const [pendingCategory, setPendingCategory] =
    useState<HeaderManagedCategorySlug | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadVisibility() {
    setLoading(true);

    try {
      const response = await fetch("/api/header-navigation", {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        navigationVisibility?: HeaderNavigationVisibility;
        error?: string;
      };

      if (!response.ok || !data.navigationVisibility) {
        toast.error(data.error ?? "Unable to load header navigation settings.");
        return;
      }

      setVisibility(data.navigationVisibility);
    } catch {
      toast.error("Unable to load header navigation settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVisibility();
  }, []);

  async function updateVisibility(category: HeaderManagedCategorySlug) {
    if (!visibility) {
      return;
    }

    const isHeaderActive = !visibility[category];
    setPendingCategory(category);

    try {
      const response = await fetch(
        `/api/admin/management/${category}/header-visibility`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isHeaderActive }),
        },
      );
      const data = (await response.json()) as {
        isHeaderActive?: boolean;
        error?: string;
      };

      if (!response.ok || typeof data.isHeaderActive !== "boolean") {
        toast.error(data.error ?? "Unable to update header navigation.");
        return;
      }

      setVisibility((current) =>
        current ? { ...current, [category]: data.isHeaderActive! } : current,
      );
      toast.success(
        data.isHeaderActive
          ? `${navigationLabels[category]} is now visible in the website header.`
          : `${navigationLabels[category]} is now hidden from the website header.`,
      );
    } catch {
      toast.error("Unable to update header navigation.");
    } finally {
      setPendingCategory(null);
    }
  }

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        title="Header navigation"
        description="Choose which menu links appear in your website header."
      >
        <Button
          type="button"
          variant="outline"
          className="rounded-lg bg-transparent"
          disabled={loading || pendingCategory !== null}
          onClick={() => void loadVisibility()}
        >
          <RefreshCcw className="size-4" />
          Refresh
        </Button>
      </AdminPageHeader>

      <AdminPanel className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Customer-facing links
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Changes are applied to the public website header immediately.
          </p>
        </div>
        <div className="divide-y divide-border">
          {HEADER_MANAGED_CATEGORIES.map((category) => {
            const isActive = visibility?.[category] ?? false;
            const pending = pendingCategory === category;
            const Icon = isActive ? Eye : EyeOff;

            return (
              <div
                key={category}
                className="flex items-center justify-between gap-5 px-5 py-4 sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-full",
                      isActive
                        ? "bg-brand-gold-soft text-brand-olive"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">
                      {navigationLabels[category]}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {isActive
                        ? "Visible in the public header"
                        : "Hidden from the public header"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isActive}
                  aria-label={`Show ${navigationLabels[category]} in the public header`}
                  disabled={loading || pending}
                  onCheckedChange={() => void updateVisibility(category)}
                />
              </div>
            );
          })}
        </div>
      </AdminPanel>
    </div>
  );
}
