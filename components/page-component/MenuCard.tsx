"use client";

import Image from "next/image";
import { Minus, Plus, ShoppingCart, X, ZoomIn } from "lucide-react";
import { useState, type PointerEvent } from "react";
import { motion, useReducedMotion, useSpring } from "motion/react";
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
  DialogTrigger,
  DialogViewport,
} from "@/components/ui/dialog";
import type { Dish } from "@/lib/menu-campaigns";
import { cn } from "@/lib/utils";

import { useCart } from "./CartProvider";

export function MenuCard({
  dish,
  source = "menu",
  variant = "default",
}: {
  dish: Dish;
  source?: string;
  variant?: "default" | "student";
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const rotateX = useSpring(0, { stiffness: 220, damping: 24, mass: 0.7 });
  const rotateY = useSpring(0, { stiffness: 220, damping: 24, mass: 0.7 });

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (reduceMotion || event.pointerType === "touch") {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;

    rotateX.set((0.5 - y) * 14);
    rotateY.set((x - 0.5) * 18);
    event.currentTarget.style.setProperty("--hologram-x", `${x * 100}%`);
    event.currentTarget.style.setProperty("--hologram-y", `${y * 100}%`);
  }

  function resetHologram(event: PointerEvent<HTMLButtonElement>) {
    rotateX.set(0);
    rotateY.set(0);
    event.currentTarget.style.setProperty("--hologram-x", "50%");
    event.currentTarget.style.setProperty("--hologram-y", "50%");
  }

  function handleAddToCart() {
    addItem(dish, source, quantity);
    toast.success(
      `${quantity} ${quantity === 1 ? "order" : "orders"} of ${dish.name} added to cart.`,
    );
    setOpen(false);
    setQuantity(1);
  }

  return (
    <div className="relative isolate h-full">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            className={cn(
              "group relative z-0 h-full w-full cursor-pointer rounded-sm text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
            )}
            aria-label={`Choose quantity for ${dish.name}`}
            onPointerMove={handlePointerMove}
            onPointerLeave={resetHologram}
          >
            {variant === "student" ? (
              <motion.article
                className="menu-hologram-card relative grid min-h-[8.75rem] grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-4 overflow-hidden rounded-sm border border-border bg-card p-3 text-left text-foreground shadow-[var(--shadow-card)] transition-colors duration-500 group-hover:border-secondary group-hover:bg-secondary group-hover:text-background group-focus-visible:border-secondary group-focus-visible:bg-secondary group-focus-visible:text-background sm:mt-20 sm:flex sm:min-h-[23rem] sm:flex-col sm:items-center sm:overflow-visible sm:px-5 sm:pb-5 sm:pt-28 sm:text-center"
                style={{ rotateX, rotateY, transformPerspective: 950 }}
                whileHover={{
                  y: -15,
                  scale: 1.045,
                  boxShadow: "var(--shadow-hologram-card)",
                }}
                whileTap={{ scale: 0.985 }}
                transition={{ type: "spring", stiffness: 250, damping: 22 }}
              >
                <span className="menu-hologram-effect" aria-hidden="true" />
                <span className="relative size-[6.5rem] shrink-0 overflow-hidden rounded-sm border-2 border-background bg-card shadow-[var(--shadow-card)] transition-all duration-700 group-hover:scale-[1.03] group-hover:border-brand-gold-soft group-focus-visible:border-brand-gold-soft sm:absolute sm:left-1/2 sm:top-0 sm:size-40 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-full sm:border-4 sm:shadow-[var(--shadow-hero-image)] sm:group-hover:rotate-3 sm:group-hover:scale-105">
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    sizes="(max-width: 639px) 6.5rem, 10rem"
                    className="object-cover"
                  />
                </span>

                <div className="min-w-0 sm:contents">
              {dish.tag ? (
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.08em] text-secondary transition-colors duration-500 group-hover:text-brand-gold-soft group-focus-visible:text-brand-gold-soft sm:text-[0.65rem]">
                  {dish.tag}
                </span>
              ) : null}
              <h3 className="mt-1 line-clamp-1 font-serif text-xl leading-tight sm:mt-3 sm:text-[clamp(1.45rem,3vw,2rem)]">
                {dish.name}
              </h3>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground transition-colors duration-500 group-hover:text-background/80 group-focus-visible:text-background/80 sm:mt-3 sm:line-clamp-3 sm:text-sm sm:leading-6">
                {dish.description}
              </p>
              <span className="mt-5 hidden h-px w-16 bg-border transition-colors duration-500 group-hover:bg-background/30 group-focus-visible:bg-background/30 sm:block" />
              <div className="mt-3 flex w-full items-end justify-between gap-3 sm:mt-auto sm:pt-5">
                <span className="font-serif text-xl font-semibold sm:text-2xl">
                  {dish.price}
                </span>
                <span className="grid size-10 place-items-center rounded-sm bg-primary text-primary-foreground shadow-[var(--shadow-primary-button)] transition-all duration-300 group-hover:rotate-90 group-hover:bg-background group-hover:text-secondary group-focus-visible:bg-background group-focus-visible:text-secondary">
                  <Plus className="size-5" />
                </span>
              </div>
                </div>
              </motion.article>
            ) : (
              <motion.div
            className="menu-hologram-card relative grid h-full min-h-[9.5rem] grid-cols-[7rem_minmax(0,1fr)] overflow-hidden rounded-sm border border-border bg-card shadow-[var(--shadow-card)] sm:flex sm:min-h-[29rem] sm:flex-col"
            style={{ rotateX, rotateY, transformPerspective: 950 }}
            whileHover={{
              y: -14,
              scale: 1.04,
              boxShadow: "var(--shadow-hologram-card)",
            }}
            whileTap={{ scale: 0.985 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <div className="relative min-h-[9.5rem] overflow-hidden border-r border-border sm:aspect-[4/3] sm:min-h-0 sm:border-b sm:border-r-0">
              <Image
                src={dish.image}
                alt={dish.name}
                fill
                sizes="(min-width: 1280px) 24vw, (min-width: 768px) 45vw, 96vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              {dish.tag ? (
                <span className="absolute left-2 top-2 rounded-sm border border-border/70 bg-popover/90 px-2 py-1 text-[0.55rem] font-bold uppercase tracking-[0.08em] text-secondary shadow-[var(--shadow-soft-icon)] backdrop-blur-sm sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-[0.65rem]">
                  {dish.tag}
                </span>
              ) : null}
            </div>
            <div className="flex min-w-0 flex-1 flex-col p-4 sm:px-6 sm:pb-5 sm:pt-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                <h3
                  className="min-w-0 truncate font-serif text-xl leading-tight text-foreground sm:flex-1 sm:text-2xl"
                  title={dish.name}
                >
                  {dish.name}
                </h3>
                <span className="hidden min-w-4 flex-1 border-b border-dotted border-secondary/50 sm:block" />
                <span className="mt-1 shrink-0 font-serif text-lg font-semibold text-primary sm:mt-0 sm:text-xl">
                  {dish.price}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground sm:mt-4 sm:line-clamp-3 sm:text-sm sm:leading-6">
                {dish.description}
              </p>
              <div className="mt-auto flex items-center justify-between pt-3 sm:border-t sm:border-border sm:pt-5">
                <span className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-secondary sm:text-xs">
                  Add to Order
                </span>
                <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-primary-button)] transition-all duration-300 group-hover:rotate-90 group-hover:scale-110 group-focus-visible:rotate-90 sm:size-10">
                  <ShoppingCart className="size-4" />
                </span>
              </div>
            </div>
              </motion.div>
            )}
          </DialogTrigger>

          <DialogPortal>
            <DialogBackdrop className="bg-foreground/40 backdrop-blur-md" />
            <DialogViewport>
              <DialogPopup className="max-w-lg overflow-hidden p-0 sm:p-0">
                <div className="border-b border-border px-5 py-5 sm:px-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <DialogTitle className="font-serif text-3xl text-foreground">
                        {dish.name}
                      </DialogTitle>
                      <DialogDescription className="mt-2 text-sm leading-6 text-muted-foreground">
                        Choose how many orders to add to your cart.
                      </DialogDescription>
                    </div>
                    <DialogClose
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm border border-border bg-background text-foreground"
                      aria-label="Close quantity picker"
                    >
                      <X className="size-4" />
                    </DialogClose>
                  </div>
                </div>

                <div className="relative aspect-[4/3] max-h-[45dvh] bg-muted/35">
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    sizes="32rem"
                    className="object-contain p-2"
                  />
                </div>

                <div className="p-5 sm:p-6">
                  <div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {dish.description}
                    </p>
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.08em] text-primary">
                      {dish.price} per order
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between rounded-sm border border-border bg-background p-3">
                    <span className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
                      Quantity
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((current) => Math.max(1, current - 1))
                        }
                        className="inline-flex size-10 items-center justify-center rounded-sm border border-border bg-card text-foreground hover:bg-muted"
                        aria-label={`Decrease ${dish.name} quantity`}
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="grid h-10 min-w-12 place-items-center rounded-sm border border-border bg-card px-4 text-base font-semibold text-foreground">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((current) => current + 1)}
                        className="inline-flex size-10 items-center justify-center rounded-sm border border-border bg-card text-foreground hover:bg-muted"
                        aria-label={`Increase ${dish.name} quantity`}
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleAddToCart}
                    className="mt-6 h-12 w-full rounded-sm text-xs font-semibold uppercase tracking-[0.08em] shadow-[var(--shadow-header-button)]"
                  >
                    Add {quantity} to Cart
                  </Button>
                </div>
              </DialogPopup>
            </DialogViewport>
          </DialogPortal>
        </Dialog>

        <Dialog>
          <DialogTrigger
            type="button"
            aria-label={`View full image of ${dish.name}`}
            className={cn(
              "group/image absolute z-30 cursor-zoom-in overflow-hidden rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
              variant === "student"
                ? "left-3 top-3 size-[6.5rem] sm:left-1/2 sm:top-0 sm:size-40 sm:-translate-x-1/2 sm:rounded-full"
                : "inset-y-0 left-0 w-28 sm:inset-x-0 sm:bottom-auto sm:aspect-[4/3] sm:w-full",
            )}
          >
            <span className="absolute inset-0 grid place-items-center bg-foreground/0 transition-colors group-hover/image:bg-foreground/25 group-focus-visible/image:bg-foreground/25">
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-background/60 bg-background/90 px-2 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-foreground opacity-90 shadow-[var(--shadow-card)] transition-opacity sm:opacity-0 sm:group-hover/image:opacity-100 sm:group-focus-visible/image:opacity-100">
                <ZoomIn className="size-4" />
                <span className="hidden sm:inline">View image</span>
              </span>
            </span>
          </DialogTrigger>

          <DialogPortal>
            <DialogBackdrop className="bg-foreground/40 backdrop-blur-md" />
            <DialogViewport>
              <DialogPopup className="max-w-5xl overflow-hidden p-0 sm:p-0">
                <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3 sm:px-5">
                  <div className="min-w-0">
                    <DialogTitle className="truncate font-serif text-2xl text-foreground sm:text-3xl">
                      {dish.name}
                    </DialogTitle>
                    <DialogDescription className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {dish.description}
                    </DialogDescription>
                  </div>
                  <DialogClose
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm border border-border bg-background text-foreground hover:bg-muted"
                    aria-label="Close image preview"
                  >
                    <X className="size-4" />
                  </DialogClose>
                </div>
                <div className="relative h-[min(74dvh,48rem)] w-full bg-muted/35">
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    sizes="(max-width: 1024px) 94vw, 64rem"
                    className="object-contain p-2 sm:p-5"
                  />
                </div>
              </DialogPopup>
            </DialogViewport>
          </DialogPortal>
        </Dialog>
      </div>
  );
}
