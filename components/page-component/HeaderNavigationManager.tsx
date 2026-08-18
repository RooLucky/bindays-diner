"use client";

import { Eye, EyeOff, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
    <div className="grid gap-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="font-serif text-2xl italic text-brand-script">
            Website Settings
          </p>
          <h1 className="mt-2 font-serif text-5xl text-foreground">
            Header Navigation
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Choose which menu links customers can see in the website header.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-sm bg-transparent"
          disabled={loading || pendingCategory !== null}
          onClick={() => void loadVisibility()}
        >
          <RefreshCcw className="size-4" />
          Refresh
        </Button>
      </section>

      <section className="overflow-hidden rounded-sm border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <h2 className="font-serif text-3xl text-foreground">
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
                        ? "bg-brand-gold-soft text-secondary"
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
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  aria-label={`Show ${navigationLabels[category]} in the public header`}
                  disabled={loading || pending}
                  onClick={() => void updateVisibility(category)}
                  className={cn(
                    "relative h-7 w-12 shrink-0 rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    isActive
                      ? "border-primary bg-primary"
                      : "border-border bg-slate-400",
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-1 top-1 size-[1.125rem] rounded-full bg-background shadow-sm transition-transform",
                      isActive ? "translate-x-5" : "translate-x-0",
                    )}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
