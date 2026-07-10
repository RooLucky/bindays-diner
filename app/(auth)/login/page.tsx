import { redirect } from "next/navigation";

import { getAdminSessionUser } from "@/lib/admin-auth";
import { AdminLoginClient } from "@/components/page-component/AdminLoginClient";

export default async function AdminLoginPage() {
  const user = await getAdminSessionUser();

  if (user) {
    redirect("/management/meal-of-the-day");
  }

  return <AdminLoginClient />;
}
