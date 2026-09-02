import { AdminLoyaltyRegistrationsClient } from "@/components/page-component/AdminLoyaltyRegistrationsClient";
import { AdminLoyaltyScanner } from "@/components/page-component/AdminLoyaltyScanner";

export default function LoyaltyManagementPage() {
  return (
    <div className="grid gap-8">
      <section>
        <p className="font-serif text-2xl italic text-brand-script">Management</p>
        <h1 className="mt-2 font-serif text-[clamp(2.25rem,7vw,3.75rem)] text-foreground">
          Loyalty Program
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Scan a customer&apos;s QR card or review every loyalty registration from one staff workspace.
        </p>
      </section>
      <AdminLoyaltyScanner />
      <AdminLoyaltyRegistrationsClient />
    </div>
  );
}
