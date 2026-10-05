"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronsUpDown,
  ExternalLink,
  LogOut,
  Store,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  adminNavigation,
  adminTopNavigation,
  getAdminPage,
} from "@/lib/admin-navigation";
import type { AdminSessionUser } from "@/lib/admin-auth";

function NavigationGroup({
  group,
}: {
  group: (typeof adminNavigation)[number];
}) {
  const pathname = usePathname();
  const { state, setOpenMobile } = useSidebar();
  const [open, setOpen] = useState(true);
  const isActive = (href: string) =>
    pathname === href ||
    (href === "/management/loyalty" &&
      pathname.startsWith("/admin/loyalty/scan/"));

  return (
    <SidebarGroup className="py-1">
      <Collapsible open={state === "collapsed" || open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex h-8 w-full items-center justify-between rounded-md px-2 text-xs font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring group-data-[collapsible=icon]:hidden">
          {group.label}
          <ChevronDown
            className={`size-3.5 transition-transform ${open ? "" : "-rotate-90"}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? "page" : undefined}
                      />
                    }
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                    onClick={() => setOpenMobile(false)}
                    className="rounded-lg"
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}

function AdminSidebar({ user }: { user: AdminSessionUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const [loggingOut, setLoggingOut] = useState(false);
  const initials = user.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  async function logout() {
    setLoggingOut(true);
    try {
      const response = await fetch("/api/admin/auth/logout", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Unable to log out.");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Unable to log out. Please try again.");
      setLoggingOut(false);
    }
  }

  return (
    <Sidebar variant="inset" collapsible="icon" aria-label="Admin navigation">
      <SidebarHeader className="pb-4 pt-3">
        <div className="flex items-center gap-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="h-12 rounded-lg px-2"
                render={<Link href="/management" />}
                onClick={() => setOpenMobile(false)}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Store className="size-5!" />
                </span>
                <span className="grid gap-0.5 text-left">
                  <span className="font-semibold">Binday&apos;s Diner</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    Management workspace
                  </span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close navigation"
              onClick={() => setOpenMobile(false)}
            >
              <X />
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="py-0">
          <SidebarMenu>
            {adminTopNavigation.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  className="rounded-lg"
                  render={
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                    />
                  }
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  onClick={() => setOpenMobile(false)}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        {adminNavigation.map((group) => (
          <NavigationGroup key={group.label} group={group} />
        ))}
      </SidebarContent>
      <SidebarFooter className="mt-2 border-t border-sidebar-border pt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton size="lg" className="rounded-lg px-2" />
                }
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-gold-soft text-xs font-semibold text-brand-olive">
                  {initials}
                </span>
                <span className="grid min-w-0 flex-1 gap-0.5 text-left">
                  <span className="truncate font-medium">{user.fullName}</span>
                  <span className="text-xs capitalize text-muted-foreground">
                    {user.role}
                  </span>
                </span>
                <ChevronsUpDown className="ml-auto size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="admin-theme min-w-60 rounded-xl"
                side={isMobile ? "top" : "right"}
                align="end"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="break-all">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    render={<Link href="/home" target="_blank" />}
                  >
                    <ExternalLink />
                    View website
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  disabled={loggingOut}
                  onClick={() => void logout()}
                >
                  <LogOut />
                  {loggingOut ? "Signing out…" : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function AdminHeader() {
  const page = getAdminPage(usePathname());
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4 sm:px-6">
      <SidebarTrigger className="-ml-1 rounded-md" />
      <Separator orientation="vertical" className="mr-1 h-4 self-center" />
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem className="hidden sm:inline-flex">
            <BreadcrumbLink render={<Link href="/management" />}>
              Management
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage className="truncate font-medium">
              {page.label}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Button
        variant="outline"
        size="sm"
        className="ml-auto rounded-lg"
        render={<Link href="/home" target="_blank" />}
        nativeButton={false}
      >
        <ExternalLink />
        <span className="hidden sm:inline">View website</span>
        <span className="sr-only sm:hidden">View website</span>
      </Button>
    </header>
  );
}

export function AdminShell({
  children,
  user,
  defaultOpen,
}: {
  children: React.ReactNode;
  user: AdminSessionUser;
  defaultOpen: boolean;
}) {
  return (
    <TooltipProvider>
      <SidebarProvider
        defaultOpen={defaultOpen}
        className="admin-theme"
        style={{ "--sidebar-width": "16.5rem" } as React.CSSProperties}
      >
        <a
          href="#admin-content"
          className="sr-only z-50 rounded-md bg-background p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <AdminSidebar user={user} />
        <SidebarInset className="min-w-0 border-border/70 md:border">
          <AdminHeader />
          <div
            id="admin-content"
            className="w-full min-w-0 flex-1 p-4 sm:p-6 lg:p-8"
          >
            {children}
          </div>
          <footer className="flex flex-wrap items-center justify-between gap-2 border-t px-6 py-4 text-xs text-muted-foreground">
            <span>Binday&apos;s Diner</span>
            <span>Restaurant management</span>
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
