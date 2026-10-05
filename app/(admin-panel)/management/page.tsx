import Link from "next/link";
import {
  ArrowRight,
  Gift,
  MessageSquare,
  ScanLine,
  Utensils,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminDashboard } from "@/lib/admin-dashboard";
import { adminNavigation, getAdminPage } from "@/lib/admin-navigation";

export default async function ManagementOverviewPage() {
  const data = await getAdminDashboard();
  const totalItems = data.sections.reduce(
    (sum, section) => sum + section.total,
    0,
  );
  const activeItems = data.sections.reduce(
    (sum, section) => sum + section.active,
    0,
  );
  const menuLinks = adminNavigation
    .slice(0, 2)
    .flatMap((group) => group.items)
    .filter((item) => !item.href.endsWith("/categories"));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Overview"
        description="Your menu, customers, and daily tasks in one place."
      >
        <Button
          className="rounded-lg"
          render={<Link href="/management/loyalty" />}
          nativeButton={false}
        >
          <ScanLine />
          Scan loyalty card
        </Button>
      </AdminPageHeader>
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          {
            label: "Menu items",
            value: totalItems,
            detail: `${activeItems} active · ${totalItems - activeItems} hidden`,
            href: "/management/main-dish",
            icon: Utensils,
            color: "bg-primary/10 text-primary",
          },
          {
            label: "Loyalty members",
            value: data.members,
            detail: "Registered in the loyalty program",
            href: "/management/loyalty",
            icon: Gift,
            color: "bg-brand-gold-soft text-brand-olive",
          },
          {
            label: "Reviews to approve",
            value: data.pendingReviews,
            detail: "Awaiting your review before publishing",
            href: "/management/reviews",
            icon: MessageSquare,
            color: "bg-brand-linen text-brand-olive",
          },
        ].map((stat) => (
          <AdminPanel key={stat.label} className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <span
                className={`flex size-9 items-center justify-center rounded-lg ${stat.color}`}
              >
                <stat.icon className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
            <Link
              href={stat.href}
              className="mt-5 inline-flex items-center gap-1.5 self-start text-xs font-medium text-foreground hover:text-primary"
            >
              Open management
              <ArrowRight className="size-3.5" />
            </Link>
          </AdminPanel>
        ))}
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[1.5fr_1fr]">
        <AdminPanel>
          <CardHeader className="border-b px-5 py-5">
            <CardTitle>Menu at a glance</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage what guests see on your website.
            </p>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="pl-5">Section</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-5">
                  <span className="sr-only">Manage</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuLinks.map((item) => {
                const section = data.sections.find((section) =>
                  item.href.endsWith(`/${section.slug}`),
                );
                return (
                  <TableRow key={item.href}>
                    <TableCell className="py-3 pl-5">
                      <Link
                        className="flex items-center gap-3 font-medium hover:text-primary"
                        href={item.href}
                      >
                        <item.icon className="size-4 text-muted-foreground" />
                        {item.label}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {section?.total ?? 0}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="rounded-md bg-brand-gold-soft font-normal text-brand-olive"
                      >
                        {section?.active ?? 0} active
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-md"
                        render={
                          <Link
                            href={item.href}
                            aria-label={`Manage ${item.label}`}
                          />
                        }
                        nativeButton={false}
                      >
                        <ArrowRight />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </AdminPanel>
        <div className="grid gap-6">
          <AdminPanel>
            <CardHeader className="border-b px-5 py-5">
              <CardTitle>Recently updated</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest changes to your menu items.
              </p>
            </CardHeader>
            <CardContent className="divide-y px-5">
              {data.recentItems.length ? (
                data.recentItems.map((item) => (
                  <Link
                    href={`/management/${item.categorySlug}`}
                    key={item.id}
                    className="group flex items-center gap-3 py-4"
                  >
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="size-10 shrink-0 rounded-lg object-cover"
                    />
                    <span className="grid min-w-0 flex-1 gap-0.5">
                      <span className="truncate text-sm font-medium group-hover:text-primary">
                        {item.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getAdminPage(`/management/${item.categorySlug}`).label}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("en-PH", {
                        month: "short",
                        day: "numeric",
                        timeZone: "Asia/Manila",
                      }).format(item.updatedAt)}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="py-8 text-sm text-muted-foreground">
                  Menu updates will appear here.
                </p>
              )}
            </CardContent>
          </AdminPanel>
          <AdminPanel className="bg-brand-cream p-5">
            <div className="flex items-center gap-2 text-brand-olive">
              <MessageSquare className="size-4" />
              <h2 className="font-semibold">Keep guests informed</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Update approved chatbot answers and choose which menu links appear
              in your website header.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg"
                render={<Link href="/management/chatbot-knowledge" />}
                nativeButton={false}
              >
                Chatbot answers
                <ArrowRight />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg"
                render={<Link href="/management/header-navigation" />}
                nativeButton={false}
              >
                Navigation
                <ArrowRight />
              </Button>
            </div>
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}
