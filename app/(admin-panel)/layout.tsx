import { AdminManagementMenu } from "@/components/page-component/AdminManagementMenu";
import { requireAdminSession } from "@/lib/admin-auth";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminSession();

  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-[92rem] items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="font-serif text-2xl italic text-brand-script">
              Binday's Diner
            </p>
            <p className="text-sm text-muted-foreground">
              Signed in as {user.fullName}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AdminManagementMenu />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[92rem] px-4 py-8">{children}</main>
    </div>
  );
}
