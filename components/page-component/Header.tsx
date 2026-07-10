"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Leaf,
  Menu,
  Minus,
  Plus,
  ShoppingCart,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogPopup,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogViewport,
} from "@/components/ui/alert-dialog";
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

import { useCart } from "./CartProvider";

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
  const [cartOpen, setCartOpen] = useState(false);
  const {
    clearCart,
    decrementItem,
    incrementItem,
    items,
    removeItem,
    setFulfillmentMode,
    subtotal,
    totalQuantity,
  } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[98dvw] flex-wrap items-center justify-between px-4 py-4 md:max-w-[95dvw] xl:max-w-[85dvw] xl:px-0">
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

      <div className="flex items-center gap-3">
        <Drawer open={cartOpen} onOpenChange={setCartOpen} swipeDirection="down">
          <DrawerTrigger
            className="relative inline-flex size-11 items-center justify-center rounded-sm border border-border bg-card text-foreground shadow-[var(--shadow-soft-icon)]"
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
                      Your Cart
                    </DrawerTitle>
                    <DrawerDescription className="mt-1 text-sm text-muted-foreground">
                      Review your pre-order list before reserving.
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
                        Estimated subtotal
                      </span>
                      <span className="font-serif text-3xl text-foreground">
                        P{subtotal.toLocaleString("en-PH")}
                      </span>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                      <AlertDialog>
                        <AlertDialogTrigger
                          className={cn(
                            buttonVariants(),
                            "h-12 rounded-sm text-xs font-semibold uppercase tracking-[0.08em] shadow-[var(--shadow-header-button)]",
                          )}
                        >
                          Reserve These Items
                        </AlertDialogTrigger>
                        <AlertDialogPortal>
                          <AlertDialogBackdrop />
                          <AlertDialogViewport>
                            <AlertDialogPopup>
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <AlertDialogTitle className="font-serif text-3xl text-foreground">
                                    How will you receive it?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="mt-2 text-sm leading-6 text-muted-foreground">
                                    Choose dine-in or delivery for the meals in your cart.
                                  </AlertDialogDescription>
                                </div>
                                <AlertDialogClose
                                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm border border-border bg-background text-foreground"
                                  aria-label="Close reservation option picker"
                                >
                                  <X className="size-4" />
                                </AlertDialogClose>
                              </div>

                              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                <Link
                                  href="/reservations"
                                  onClick={() => {
                                    setFulfillmentMode("dine-in");
                                    setCartOpen(false);
                                  }}
                                  className="rounded-sm border border-border bg-background p-4 text-left transition-colors hover:bg-muted"
                                >
                                  <span className="flex size-11 items-center justify-center rounded-full bg-brand-gold-soft text-secondary">
                                    <Store className="size-5" />
                                  </span>
                                  <span className="mt-4 block font-serif text-2xl text-foreground">
                                    Dine In
                                  </span>
                                  <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                                    Reserve these meals and a table for your visit.
                                  </span>
                                </Link>
                                <Link
                                  href="/reservations"
                                  onClick={() => {
                                    setFulfillmentMode("delivery");
                                    setCartOpen(false);
                                  }}
                                  className="rounded-sm border border-border bg-background p-4 text-left transition-colors hover:bg-muted"
                                >
                                  <span className="flex size-11 items-center justify-center rounded-full bg-brand-gold-soft text-secondary">
                                    <Home className="size-5" />
                                  </span>
                                  <span className="mt-4 block font-serif text-2xl text-foreground">
                                    Deliver to Home
                                  </span>
                                  <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                                    Send delivery address and preferred delivery time.
                                  </span>
                                </Link>
                              </div>
                            </AlertDialogPopup>
                          </AlertDialogViewport>
                        </AlertDialogPortal>
                      </AlertDialog>
                      <button
                        type="button"
                        onClick={clearCart}
                        className="h-12 rounded-sm border border-border bg-background px-5 text-xs font-semibold uppercase tracking-[0.08em] text-foreground hover:bg-muted"
                      >
                        Clear Cart
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-8 rounded-sm border border-border bg-background px-5 py-8 text-center">
                    <p className="font-serif text-2xl text-foreground">
                      Your cart is empty.
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Click any dish from the menu pages to add it here.
                    </p>
                  </div>
                )}
              </DrawerPopup>
            </DrawerViewport>
          </DrawerPortal>
        </Drawer>

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

              </DrawerPopup>
            </DrawerViewport>
          </DrawerPortal>
        </Drawer>
      </div>
      </div>
    </header>
  );
}
