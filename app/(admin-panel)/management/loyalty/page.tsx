import { AdminLoyaltyRegistrationsClient } from "@/components/page-component/AdminLoyaltyRegistrationsClient";
import { AdminLoyaltyScanner } from "@/components/page-component/AdminLoyaltyScanner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function LoyaltyManagementPage() {
  return (
    <div className="grid gap-6">
      <AdminPageHeader
        title="Loyalty program"
        description="Scan customer cards, manage stamps, and review registered members."
      />
      <AdminLoyaltyScanner />
      <AdminLoyaltyRegistrationsClient />
    </div>
  );
}
