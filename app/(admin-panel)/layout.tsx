import Link from "next/link";

import { AdminLogoutButton } from "@/components/page-component/AdminLogoutButton";
import { requireAdminSession } from "@/lib/admin-auth";

const navItems = [
  { label: "Chatbot Knowledge", href: "/management/chatbot-knowledge" },
  { label: "Meal of the Day", href: "/management/meal-of-the-day" },
  { label: "Best Seller", href: "/management/best-seller" },
  { label: "Promo", href: "/management/promo" },
  { label: "Student Meal", href: "/management/student-meal" },
  { label: "Main Dish", href: "/management/main-dish" },
];

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminSession();

  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-[92rem] flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-serif text-2xl italic text-brand-script">
              Bindays Diner
            </p>
            <p className="text-sm text-muted-foreground">
              Signed in as {user.fullName}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-sm border border-border bg-background px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-foreground hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            <AdminLogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[92rem] px-4 py-8">{children}</main>
    </div>
  );
}
