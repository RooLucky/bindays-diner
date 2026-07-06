"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerDescription,
  DrawerPopup,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
  DrawerViewport,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/home" },
  { label: "Menu", href: "/menu" },
  { label: "Student Meals", href: "/student-meals" },
  { label: "Promos", href: "/promos" },
  { label: "Meal of the Day", href: "/meal-of-the-day" },
  { label: "Best Seller", href: "/best-seller" },
  { label: "Loyalty", href: "/loyalty" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="mx-auto flex w-full max-w-[98dvw] flex-wrap items-center justify-between px-4 py-5 sm:py-6 md:max-w-[95dvw] xl:max-w-[85dvw] xl:px-0">
      <Link href="/home" className="flex items-center gap-3" aria-label="Bindays Diner home">
        <span className="flex size-9 items-center justify-center text-secondary sm:size-10">
          <Leaf className="size-6 sm:size-7" strokeWidth={1.5} />
        </span>
        <span className="leading-none">
          <span className="block font-serif text-2xl text-primary sm:text-3xl">
            Bindays Diner
          </span>
          <span className="block pt-1 text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground sm:text-[0.65rem] sm:tracking-[0.38em]">
            Italian Kitchen
          </span>
        </span>
      </Link>

      <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.08em] text-foreground xl:flex 2xl:gap-9">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative shrink-0 py-2 transition-colors hover:text-primary",
              pathname === item.href &&
                "text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-primary",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <Link
        href="/reservations"
        className={cn(
          buttonVariants(),
          "hidden h-11 rounded-sm px-6 text-xs uppercase tracking-[0.08em] shadow-[var(--shadow-header-button)] xl:inline-flex",
        )}
      >
        Book a Table
      </Link>

      <Drawer open={menuOpen} onOpenChange={setMenuOpen} swipeDirection="down">
        <DrawerTrigger
          className="inline-flex size-11 items-center justify-center rounded-sm border border-border bg-card text-foreground shadow-[var(--shadow-soft-icon)] xl:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </DrawerTrigger>
        <DrawerPortal>
          <DrawerBackdrop />
          <DrawerViewport>
            <DrawerPopup>
              <div className="mx-auto mb-5 h-1.5 w-14 rounded-full bg-border" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DrawerTitle className="font-serif text-3xl text-primary">
                    Bindays Diner
                  </DrawerTitle>
                  <DrawerDescription className="mt-1 text-sm text-muted-foreground">
                    Choose a page to continue.
                  </DrawerDescription>
                </div>
                <DrawerClose
                  className="inline-flex size-9 items-center justify-center rounded-sm border border-border bg-background text-foreground"
                  aria-label="Close navigation menu"
                >
                  <X className="size-4" />
                </DrawerClose>
              </div>

              <nav className="mt-7 grid gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-sm border border-transparent px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:border-border hover:bg-background",
                      pathname === item.href &&
                        "border-primary/25 bg-background text-primary",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <Link
                href="/reservations"
                onClick={() => setMenuOpen(false)}
                className={cn(
                  buttonVariants(),
                  "mt-6 h-12 w-full rounded-sm text-xs font-semibold uppercase tracking-[0.08em] shadow-[var(--shadow-header-button)]",
                )}
              >
                Book a Table
              </Link>
            </DrawerPopup>
          </DrawerViewport>
        </DrawerPortal>
      </Drawer>
    </header>
  );
}
