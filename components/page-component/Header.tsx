"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogIn, Menu, Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import Ably from "ably";
import type { InboundMessage } from "ably";

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
import {
  DEFAULT_HEADER_NAVIGATION_VISIBILITY,
  HEADER_MANAGED_CATEGORIES,
  HEADER_MANAGED_ROUTES,
  type HeaderManagedCategorySlug,
  type HeaderNavigationVisibility,
} from "@/lib/header-navigation-contracts";
import {
  MENU_CONTENT_CHANNEL,
  MENU_CONTENT_UPDATED_EVENT,
  type MenuContentUpdatedMessage,
} from "@/lib/realtime-contracts";

import { useCart } from "./CartProvider";
import Image from "next/image";

type NavigationItem = {
  label: string;
  href: string;
  managedCategory?: HeaderManagedCategorySlug;
};

const navItems: NavigationItem[] = [
  { label: "Home", href: "/home" },
  { label: "Menu", href: "/menu" },
  { label: "Add-ons", href: "/add-ons", managedCategory: "add-ons" },
  { label: "Drinks", href: "/drinks", managedCategory: "drinks" },
  {
    label: "Student Meals",
    href: "/student-meals",
    managedCategory: "student-meal",
  },
  { label: "Promos", href: "/promos", managedCategory: "promo" },
  {
    label: "Meal of the Day",
    href: "/meal-of-the-day",
    managedCategory: "meal-of-the-day",
  },
  {
    label: "Best Seller",
    href: "/best-seller",
    managedCategory: "best-seller",
  },
  {
    label: "Bilao Trays",
    href: "/bilao",
    managedCategory: "bilao-tray",
  },
  { label: "Loyalty", href: "/loyalty" },
];

function isHeaderNavigationUpdate(
  value: unknown,
): value is MenuContentUpdatedMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Partial<MenuContentUpdatedMessage>;

  return (
    typeof message.categorySlug === "string" &&
    HEADER_MANAGED_CATEGORIES.includes(
      message.categorySlug as HeaderManagedCategorySlug,
    )
  );
}

export function Header({
  navigationVisibility = DEFAULT_HEADER_NAVIGATION_VISIBILITY,
  realtimeEnabled = false,
}: {
  navigationVisibility?: HeaderNavigationVisibility;
  realtimeEnabled?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [liveNavigationVisibility, setLiveNavigationVisibility] = useState(
    navigationVisibility,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const {
    clearCart,
    decrementItem,
    incrementItem,
    items,
    removeItem,
    subtotal,
    totalQuantity,
  } = useCart();
  const currentManagedCategory = useMemo(() => {
    return Object.entries(HEADER_MANAGED_ROUTES).find(
      ([, route]) => route === pathname,
    )?.[0] as HeaderManagedCategorySlug | undefined;
  }, [pathname]);
  const visibleNavItems = navItems.filter(
    (item) =>
      !item.managedCategory ||
      liveNavigationVisibility[item.managedCategory],
  );

  useEffect(() => {
    setLiveNavigationVisibility(navigationVisibility);
  }, [navigationVisibility]);

  useEffect(() => {
    let isMounted = true;
    let activeRequest: AbortController | undefined;

    async function refreshNavigationVisibility() {
      activeRequest?.abort();
      const requestController = new AbortController();
      activeRequest = requestController;

      try {
        const response = await fetch("/api/header-navigation", {
          cache: "no-store",
          signal: requestController.signal,
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          navigationVisibility?: HeaderNavigationVisibility;
        };

        if (!payload.navigationVisibility || !isMounted) {
          return;
        }

        setLiveNavigationVisibility(payload.navigationVisibility);

        if (
          currentManagedCategory &&
          !payload.navigationVisibility[currentManagedCategory]
        ) {
          setMenuOpen(false);
          router.replace("/home");
          router.refresh();
        }
      } catch (error) {
        if (
          !requestController.signal.aborted &&
          !(error instanceof DOMException && error.name === "AbortError")
        ) {
          console.warn("Unable to refresh header navigation.", error);
        }
      }
    }

    void refreshNavigationVisibility();

    const intervalId = window.setInterval(refreshNavigationVisibility, 5000);
    const handleWindowFocus = () => void refreshNavigationVisibility();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshNavigationVisibility();
      }
    };
    const realtime = realtimeEnabled
      ? new Ably.Realtime({
          authUrl: "/api/realtime/token",
          authMethod: "GET",
          useTokenAuth: true,
        })
      : undefined;
    const channel = realtime?.channels.get(MENU_CONTENT_CHANNEL);
    const handleRealtimeUpdate = (message: InboundMessage) => {
      if (isHeaderNavigationUpdate(message.data)) {
        void refreshNavigationVisibility();
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    void channel
      ?.subscribe(MENU_CONTENT_UPDATED_EVENT, handleRealtimeUpdate)
      .catch(() => undefined);

    return () => {
      isMounted = false;
      activeRequest?.abort();
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      channel?.unsubscribe(MENU_CONTENT_UPDATED_EVENT, handleRealtimeUpdate);
      realtime?.close();
    };
  }, [currentManagedCategory, realtimeEnabled, router]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[98dvw] flex-wrap items-center justify-between px-4 py-4 md:max-w-[95dvw] xl:max-w-[85dvw] xl:px-0">
        <Link
          href="/home"
          className="flex items-center gap-3"
          aria-label="Binday's Diner home"
        >
          <span className="flex size-9 items-center justify-center text-secondary sm:size-10">
            <Image
              src="/images/web-logo.png"
              alt="Binday's Diner logo"
              width={1254}
              height={1254}
              className="w-full h-full object-contain"
            />
          </span>
          <span className="leading-none">
            <span className="block font-serif text-xl text-primary sm:text-2xl">
              Binday's Diner
            </span>
            <span className="block pt-1 text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground sm:text-[0.65rem] sm:tracking-[0.38em]">
              Legazpi City
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.08em] text-foreground xl:flex 2xl:gap-9">
          {visibleNavItems.map((item) => (
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

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden size-11 items-center justify-center rounded-sm border border-border bg-card text-foreground shadow-[var(--shadow-soft-icon)] transition-colors hover:bg-muted xl:inline-flex"
            aria-label="Staff login"
            title="Staff login"
          >
            <LogIn className="size-5" />
          </Link>
          <Drawer
            open={cartOpen}
            onOpenChange={setCartOpen}
            swipeDirection="down"
          >
            <DrawerTrigger
              className="relative hidden size-11 items-center justify-center rounded-sm border border-border bg-card text-foreground shadow-[var(--shadow-soft-icon)] xl:inline-flex"
              aria-label="Open cart"
            >
              <ShoppingCart className="size-5" />
              {totalQuantity > 0 ? (
                <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-primary text-[0.7rem] font-bold text-primary-foreground">
                  {totalQuantity}
                </span>
              ) : null}
            </DrawerTrigger>
            <DrawerPortal>
              <DrawerBackdrop />
              <DrawerViewport>
                <DrawerPopup className="mx-auto max-w-3xl">
                  <div className="mx-auto mb-5 h-1.5 w-14 rounded-full bg-border" />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <DrawerTitle className="font-serif text-3xl text-primary">
                        Your Food Order
                      </DrawerTitle>
                      <DrawerDescription className="mt-1 text-sm text-muted-foreground">
                        Review your meals, then enter your delivery details.
                      </DrawerDescription>
                    </div>
                    <DrawerClose
                      className="inline-flex size-9 items-center justify-center rounded-sm border border-border bg-background text-foreground"
                      aria-label="Close cart"
                    >
                      <X className="size-4" />
                    </DrawerClose>
                  </div>

                  {items.length > 0 ? (
                    <>
                      <div className="mt-7 max-h-[42dvh] space-y-4 overflow-y-auto pr-1">
                        <AnimatePresence initial={false}>
                          {items.map((item) => (
                            <motion.div
                              key={item.id}
                              layout
                              initial={{ opacity: 0, x: 18, scale: 0.96 }}
                              animate={{ opacity: 1, x: 0, scale: 1 }}
                              exit={{ opacity: 0, x: -18, scale: 0.96 }}
                              transition={{ duration: 0.22 }}
                              className="grid grid-cols-[4.5rem_1fr] gap-4 rounded-sm border border-border bg-background p-3"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="aspect-square w-full rounded-sm object-cover"
                              />
                              <div className="min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <h3 className="font-serif text-xl leading-tight text-foreground">
                                      {item.name}
                                    </h3>
                                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                                      {item.price}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeItem(item.id)}
                                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-sm border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                    aria-label={`Remove ${item.name}`}
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => decrementItem(item.id)}
                                    className="inline-flex size-8 items-center justify-center rounded-sm border border-border bg-card text-foreground hover:bg-muted"
                                    aria-label={`Decrease ${item.name} quantity`}
                                  >
                                    <Minus className="size-4" />
                                  </button>
                                  <span className="grid h-8 min-w-10 place-items-center rounded-sm border border-border bg-card px-3 text-sm font-semibold text-foreground">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => incrementItem(item.id)}
                                    className="inline-flex size-8 items-center justify-center rounded-sm border border-border bg-card text-foreground hover:bg-muted"
                                    aria-label={`Increase ${item.name} quantity`}
                                  >
                                    <Plus className="size-4" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
                        <span className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                          Order subtotal
                        </span>
                        <span className="font-serif text-3xl text-foreground">
                          P{subtotal.toLocaleString("en-PH")}
                        </span>
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                        <Link
                          href="/reservations"
                          onClick={() => setCartOpen(false)}
                          className={cn(
                            buttonVariants(),
                            "h-12 rounded-sm text-xs font-semibold uppercase tracking-[0.08em] shadow-[var(--shadow-header-button)]",
                          )}
                        >
                          Continue to Delivery
                        </Link>
                        <button
                          type="button"
                          onClick={clearCart}
                          className="h-12 rounded-sm border border-border bg-background px-5 text-xs font-semibold uppercase tracking-[0.08em] text-foreground hover:bg-muted"
                        >
                          Clear Order
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="mt-8 rounded-sm border border-border bg-background px-5 py-8 text-center">
                      <p className="font-serif text-2xl text-foreground">
                        Your food order is empty.
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Choose a dish from any menu page to start your order.
                      </p>
                    </div>
                  )}
                </DrawerPopup>
              </DrawerViewport>
            </DrawerPortal>
          </Drawer>

          <Drawer
            open={menuOpen}
            onOpenChange={setMenuOpen}
            swipeDirection="down"
          >
            <DrawerTrigger
              className="relative inline-flex size-11 items-center justify-center rounded-sm border border-border bg-card text-foreground shadow-[var(--shadow-soft-icon)] xl:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
              {totalQuantity > 0 ? (
                <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-primary text-[0.7rem] font-bold text-primary-foreground">
                  {totalQuantity}
                </span>
              ) : null}
            </DrawerTrigger>
            <DrawerPortal>
              <DrawerBackdrop />
              <DrawerViewport>
                <DrawerPopup className="flex h-[50dvh] max-h-[50dvh] flex-col overflow-hidden p-0 xl:hidden">
                  <div className="shrink-0 px-6 pt-4">
                    <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-border" />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <DrawerTitle className="font-serif text-3xl text-primary">
                          Binday's Diner
                        </DrawerTitle>
                        <DrawerDescription className="mt-1 text-sm text-muted-foreground">
                          Choose a page to continue.
                        </DrawerDescription>
                      </div>
                      <DrawerClose
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm border border-border bg-background text-foreground"
                        aria-label="Close navigation menu"
                      >
                        <X className="size-4" />
                      </DrawerClose>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6">
                    <nav className="mt-5 grid gap-2">
                      {visibleNavItems.map((item) => (
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
                    <div className="mt-6 grid gap-2 border-t border-border pt-5">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setCartOpen(true);
                        }}
                        className="flex min-h-12 items-center justify-between rounded-sm border border-border bg-background px-4 text-sm font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-muted"
                      >
                        <span className="flex items-center gap-3">
                          <ShoppingCart className="size-5" />
                          Your Cart
                        </span>
                        {totalQuantity > 0 ? (
                          <span className="grid size-6 place-items-center rounded-full bg-primary text-[0.7rem] font-bold text-primary-foreground">
                            {totalQuantity}
                          </span>
                        ) : null}
                      </button>
                      <Link
                        href="/login"
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-12 items-center gap-3 rounded-sm border border-border bg-background px-4 text-sm font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-muted"
                      >
                        <LogIn className="size-5" />
                        Admin Login
                      </Link>
                    </div>
                  </div>
                </DrawerPopup>
              </DrawerViewport>
            </DrawerPortal>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
