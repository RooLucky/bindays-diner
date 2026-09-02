import { AdminLoyaltyStampClient } from "@/components/page-component/AdminLoyaltyStampClient";
import { requireAdminSession } from "@/lib/admin-auth";

export default async function AdminLoyaltyScanPage({
  params,
}: {
  params: Promise<{ memberCode: string }>;
}) {
  await requireAdminSession();
  const { memberCode } = await params;

  return <AdminLoyaltyStampClient memberCode={memberCode} />;
}
