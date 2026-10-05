"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogPopup,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogViewport,
} from "@/components/ui/alert-dialog";
import { FOODPANDA_ORDER_URL } from "@/lib/order-policy";

export function MinimumOrderAlert({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogPortal>
        <AlertDialogBackdrop />
        <AlertDialogViewport>
          <AlertDialogPopup>
            <AlertDialogTitle className="text-xl font-semibold">
              Minimum order is ₱500
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-3 text-sm leading-6 text-muted-foreground">
              Food subtotal must be ₱500 or more, excluding the ₱50 delivery
              fee. Delivery is within Legazpi City only. Add more items to your
              cart, or order a smaller amount through Foodpanda.
            </AlertDialogDescription>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <AlertDialogClose render={<Button variant="outline" />}>
                Keep shopping
              </AlertDialogClose>
              <a className={buttonVariants()} href={FOODPANDA_ORDER_URL}>
                Order on Foodpanda
              </a>
            </div>
          </AlertDialogPopup>
        </AlertDialogViewport>
      </AlertDialogPortal>
    </AlertDialog>
  );
}
