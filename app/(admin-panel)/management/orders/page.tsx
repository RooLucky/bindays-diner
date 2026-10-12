import { AdminOrdersClient } from "@/components/page-component/AdminOrdersClient";
import { requireAdminSession } from "@/lib/admin-auth";
export default async function OrdersManagementPage() {
  const user = await requireAdminSession();
  return <AdminOrdersClient userId={user.id} />;
}
