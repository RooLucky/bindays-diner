"use client";

import Image from "next/image";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { useState, type PointerEvent } from "react";
import { motion, useReducedMotion, useSpring } from "motion/react";
import { toast } from "sonner";

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
import { Button } from "@/components/ui/button";
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
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        className={cn(
          "group w-full cursor-pointer rounded-sm text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
        )}
        aria-label={`Choose quantity for ${dish.name}`}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetHologram}
      >
        {variant === "student" ? (
          <motion.article
            className="menu-hologram-card relative mt-16 flex min-h-[21rem] flex-col items-center rounded-sm border border-border bg-card px-4 pb-5 pt-24 text-center text-foreground shadow-[var(--shadow-card)] transition-colors duration-500 group-hover:border-secondary group-hover:bg-secondary group-hover:text-background group-focus-visible:border-secondary group-focus-visible:bg-secondary group-focus-visible:text-background sm:mt-20 sm:min-h-[23rem] sm:px-5 sm:pt-28"
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
            <span
              className="absolute left-1/2 top-0 size-36 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-4 border-background bg-card shadow-[var(--shadow-hero-image)] transition-all duration-700 group-hover:rotate-3 group-hover:scale-105 group-hover:border-brand-gold-soft group-focus-visible:border-brand-gold-soft sm:size-40"
            >
              <Image
                src={dish.image}
                alt={dish.name}
                fill
                sizes="(max-width: 639px) 9rem, 10rem"
                className="object-cover"
              />
            </span>

            {dish.tag ? (
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-secondary transition-colors duration-500 group-hover:text-brand-gold-soft group-focus-visible:text-brand-gold-soft">
                {dish.tag}
              </span>
            ) : null}
            <h3 className="mt-3 font-serif text-[clamp(1.45rem,3vw,2rem)] leading-tight">
              {dish.name}
            </h3>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground transition-colors duration-500 group-hover:text-background/80 group-focus-visible:text-background/80">
              {dish.description}
            </p>
            <span className="mt-5 h-px w-16 bg-border transition-colors duration-500 group-hover:bg-background/30 group-focus-visible:bg-background/30" />
            <div className="mt-auto flex w-full items-end justify-between gap-3 pt-5">
              <span className="font-serif text-2xl font-semibold">
                {dish.price}
              </span>
              <span
                className="grid size-10 place-items-center rounded-sm bg-primary text-primary-foreground transition-all duration-300 group-hover:rotate-90 group-hover:bg-background group-hover:text-secondary group-focus-visible:bg-background group-focus-visible:text-secondary"
              >
                <Plus className="size-5" />
              </span>
            </div>
          </motion.article>
        ) : (
          <motion.div
            className="menu-hologram-card relative overflow-hidden rounded-sm border border-border bg-card shadow-[var(--shadow-card)]"
            style={{ rotateX, rotateY, transformPerspective: 950 }}
            whileHover={{
              y: -14,
              scale: 1.04,
              boxShadow: "var(--shadow-hologram-card)",
            }}
            whileTap={{ scale: 0.985 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <span className="menu-hologram-effect" aria-hidden="true" />
            <div className="relative aspect-[2.05/1] overflow-hidden">
              <Image
                src={dish.image}
                alt={dish.name}
                fill
                sizes="(min-width: 1280px) 24vw, (min-width: 768px) 45vw, 96vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              {dish.tag ? (
                <span className="absolute left-3 top-3 rounded-full bg-popover/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-secondary shadow-[var(--shadow-soft-icon)]">
                  {dish.tag}
                </span>
              ) : null}
              <span className="absolute bottom-[-1.2rem] right-4 grid size-16 place-items-center rounded-full bg-brand-price text-lg font-semibold text-foreground shadow-[var(--shadow-price)] transition-transform duration-500 group-hover:scale-110">
                {dish.price}
              </span>
            </div>
            <div className="px-5 pb-7 pt-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-serif text-2xl leading-tight text-foreground">
                  {dish.name}
                </h3>
                <span className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-all duration-300 group-hover:rotate-[-8deg] group-hover:opacity-100 group-focus-visible:opacity-100">
                  <ShoppingCart className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {dish.description}
              </p>
            </div>
          </motion.div>
        )}
      </AlertDialogTrigger>

      <AlertDialogPortal>
        <AlertDialogBackdrop />
        <AlertDialogViewport>
          <AlertDialogPopup>
            <div className="flex items-start justify-between gap-4">
              <div>
                <AlertDialogTitle className="font-serif text-3xl text-foreground">
                  {dish.name}
                </AlertDialogTitle>
                <AlertDialogDescription className="mt-2 text-sm leading-6 text-muted-foreground">
                  Choose how many orders to add to your cart.
                </AlertDialogDescription>
              </div>
              <AlertDialogClose
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm border border-border bg-background text-foreground"
                aria-label="Close quantity picker"
              >
                <X className="size-4" />
              </AlertDialogClose>
            </div>

            <div className="mt-5 overflow-hidden rounded-sm border border-border bg-background">
              <div className="relative aspect-[2.05/1]">
                <Image
                  src={dish.image}
                  alt={dish.name}
                  fill
                  sizes="24rem"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  {dish.description}
                </p>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.08em] text-primary">
                  {dish.price} per order
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-sm border border-border bg-background p-3">
              <span className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
                Quantity
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
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
          </AlertDialogPopup>
        </AlertDialogViewport>
      </AlertDialogPortal>
    </AlertDialog>
  );
}
