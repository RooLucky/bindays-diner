"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function AdminLogoutButton() {
  const router = useRouter();

  async function logout() {
    const response = await fetch("/api/admin/auth/logout", { method: "POST" });

    if (!response.ok) {
      toast.error("Unable to log out.");
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="rounded-sm bg-transparent"
      onClick={logout}
    >
      <LogOut className="size-4" />
      Logout
    </Button>
  );
}
