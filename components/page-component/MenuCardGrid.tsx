"use client";

import { useMemo, useState } from "react";

import type { Dish } from "@/lib/menu-campaigns";
import { cn } from "@/lib/utils";

import { MenuCard } from "./MenuCard";
import { StaggerContainer, StaggerItem } from "./MotionEffects";

export function MenuCardGrid({
  dishes,
  source,
  variant = "default",
  className,
}: {
  dishes: Dish[];
  source: string;
  variant?: "default" | "student";
  className: string;
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = useMemo(
    () =>
      Array.from(
        new Set(dishes.flatMap((dish) => (dish.tag ? [dish.tag] : []))),
      ),
    [dishes],
  );
  const filteredDishes =
    selectedCategory === "All"
      ? dishes
      : dishes.filter((dish) => dish.tag === selectedCategory);

  return (
    <>
      {categories.length > 1 ? (
        <nav
          aria-label="Filter menu by category"
          className="mt-8 flex gap-2 overflow-x-auto py-4 sm:mt-10 sm:justify-center"
        >
          {["All", ...categories].map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition-colors",
                selectedCategory === category
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-secondary hover:text-foreground",
              )}
            >
              {category}
            </button>
          ))}
        </nav>
      ) : null}

      <StaggerContainer revealOnMount className={className}>
        {filteredDishes.map((dish) => (
          <StaggerItem key={dish.name} className="h-full">
            <MenuCard dish={dish} source={source} variant={variant} />
          </StaggerItem>
        ))}
      </StaggerContainer>
    </>
  );
}
