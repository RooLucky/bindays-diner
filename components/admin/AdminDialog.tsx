"use client";

import { DialogPopup } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function AdminDialogPopup({
  className,
  ...props
}: React.ComponentProps<typeof DialogPopup>) {
  return (
    <DialogPopup
      className={cn("admin-theme rounded-xl shadow-xl", className)}
      {...props}
    />
  );
}
