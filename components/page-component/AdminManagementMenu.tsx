"use client";

import { Check, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { AdminLogoutButton } from "@/components/page-component/AdminLogoutButton";
import {
  Popover,
  PopoverClose,
  PopoverPopup,
  PopoverPortal,
  PopoverPositioner,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const managementGroups = [
  {
    label: "Menu catalog",
    links: [
      { label: "Menu Categories", href: "/management/categories" },
      { label: "Main Dishes", href: "/management/main-dish" },
      { label: "Student Meals", href: "/management/student-meal" },
      { label: "Bilao Trays", href: "/management/bilao-tray" },
      { label: "Add-ons", href: "/management/add-ons" },
      { label: "Drinks", href: "/management/drinks" },
    ],
  },
  {
    label: "Featured menus",
    links: [
      { label: "Meal of the Day", href: "/management/meal-of-the-day" },
      { label: "Best Sellers", href: "/management/best-seller" },
      { label: "Promotions", href: "/management/promo" },
    ],
  },
  {
    label: "Customer experience",
    links: [{ label: "Reviews", href: "/management/reviews" }],
  },
  {
    label: "System settings",
    links: [
      { label: "Header Navigation", href: "/management/header-navigation" },
      { label: "Chatbot Knowledge", href: "/management/chatbot-knowledge" },
    ],
  },
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
            size="icon"
            className="rounded-sm bg-transparent"
            aria-label="Open management menu"
          />
        }
      >
        <Menu className="size-5" />
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner align="end">
          <PopoverPopup className="w-[min(22rem,calc(100vw-2rem))] p-2">
            <nav aria-label="Management pages" className="grid gap-3">
              {managementGroups.map((group) => (
                <section key={group.label}>
                  <p className="px-2 pb-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {group.label}
                  </p>
                  <div className="grid gap-0.5">
                    {group.links.map((item) => {
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
                  </div>
                </section>
              ))}
              <div className="border-t border-border pt-2">
                <AdminLogoutButton className="h-10 w-full justify-start rounded-sm border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive" />
              </div>
            </nav>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  );
}
