import { AdminLoyaltyStampClient } from "@/components/page-component/AdminLoyaltyStampClient";

export default async function AdminLoyaltyScanPage({
  params,
}: {
  params: Promise<{ memberCode: string }>;
}) {
  const { memberCode } = await params;

  return <AdminLoyaltyStampClient memberCode={memberCode} />;
}

