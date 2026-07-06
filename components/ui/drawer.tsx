"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";

import { cn } from "@/lib/utils";

const Drawer = DrawerPrimitive.Root;
const DrawerTrigger = DrawerPrimitive.Trigger;
const DrawerPortal = DrawerPrimitive.Portal;
const DrawerTitle = DrawerPrimitive.Title;
const DrawerDescription = DrawerPrimitive.Description;
const DrawerClose = DrawerPrimitive.Close;

function DrawerViewport({
  className,
  ...props
}: DrawerPrimitive.Viewport.Props) {
  return (
    <DrawerPrimitive.Viewport
      className={cn("fixed inset-0 z-50 pointer-events-none", className)}
      {...props}
    />
  );
}

function DrawerBackdrop({
  className,
  ...props
}: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-foreground/25 opacity-100 backdrop-blur-sm transition-opacity duration-200 ease-out data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function DrawerPopup({ className, ...props }: DrawerPrimitive.Popup.Props) {
  return (
    <DrawerPrimitive.Popup
      className={cn(
        "pointer-events-auto fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] translate-y-0 rounded-t-lg border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-transform duration-300 ease-out will-change-transform data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full",
        className,
      )}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerDescription,
  DrawerPopup,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
  DrawerViewport,
};
