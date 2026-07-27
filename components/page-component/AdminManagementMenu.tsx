"use client";

import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const managementLinks = [
  { label: "Chatbot Knowledge", href: "/management/chatbot-knowledge" },
  { label: "Categories", href: "/management/categories" },
  { label: "Drinks", href: "/management/drinks" },
  { label: "Meal of the Day", href: "/management/meal-of-the-day" },
  { label: "Best Seller", href: "/management/best-seller" },
  { label: "Promo", href: "/management/promo" },
  { label: "Student Meal", href: "/management/student-meal" },
  { label: "Main Dish", href: "/management/main-dish" },
];

export function AdminManagementMenu() {
  const pathname = usePathname();

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="rounded-sm bg-transparent font-semibold uppercase tracking-[0.08em]"
          />
        }
      >
        Management
        <ChevronDown className="size-4 transition-transform group-aria-expanded/button:rotate-180" />
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner align="end">
          <PopoverPopup className="w-[min(20rem,calc(100vw-2rem))] p-1.5">
            <nav aria-label="Management pages" className="grid gap-0.5">
              {managementLinks.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <PopoverClose
                    key={item.href}
                    nativeButton={false}
                    render={
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex min-h-10 items-center justify-between rounded-sm px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                          isActive && "bg-muted text-foreground",
                        )}
                      />
                    }
                  >
                    <span>{item.label}</span>
                    {isActive ? <Check className="size-4 text-primary" /> : null}
                  </PopoverClose>
                );
              })}
            </nav>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  );
}
