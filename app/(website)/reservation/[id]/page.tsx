import { ReservationPaymentClient } from "@/components/page-component/ReservationPaymentClient";
import { getReservationPaymentDetails } from "@/lib/reservations";

export const dynamic = "force-dynamic";

export default async function ReservationPaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ id }, { token }] = await Promise.all([params, searchParams]);

  if (!token) {
    return <PaymentLinkError />;
  }

  try {
    const reservation = await getReservationPaymentDetails(id, token);
    return <ReservationPaymentClient initialReservation={reservation} token={token} />;
  } catch {
    return <PaymentLinkError />;
  }
}

function PaymentLinkError() {
  return (
    <section className="bg-background px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-xl rounded-sm border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Binday&apos;s Diner</p>
        <h1 className="mt-3 font-serif text-[clamp(2.2rem,7vw,3rem)] text-foreground">Payment link unavailable</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">This payment link is invalid or unavailable. Please contact the diner if you need help with your reservation.</p>
      </div>
    </section>
  );
}
