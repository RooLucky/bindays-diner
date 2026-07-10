"use client";

import Image from "next/image";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";
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
}: {
  dish: Dish;
  source?: string;
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [open, setOpen] = useState(false);

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
          "group w-full rounded-sm text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
        )}
        aria-label={`Choose quantity for ${dish.name}`}
      >
        <motion.div
          className="overflow-hidden rounded-sm border border-border bg-card shadow-[var(--shadow-card)]"
          whileHover={{
            y: -8,
            scale: 1.018,
            boxShadow: "var(--shadow-hero-image)",
          }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
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
