"use client";

import Image from "next/image";
import { FormEvent, useState, useTransition } from "react";
import { CheckCircle2, Copy, CreditCard, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ReservationPaymentDetails } from "@/lib/reservation-contracts";

const paymentNumber = "09565021661";

export function ReservationPaymentClient({
  initialReservation,
  token,
}: {
  initialReservation: ReservationPaymentDetails;
  token: string;
}) {
  const [reservation, setReservation] = useState(initialReservation);
  const [isPending, startTransition] = useTransition();

  async function copyPaymentNumber() {
    try {
      await navigator.clipboard.writeText(paymentNumber);
      toast.success("Payment number copied.");
    } catch {
      toast.error("Unable to copy the payment number.");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("token", token);

    startTransition(async () => {
      const response = await fetch(`/api/reservations/${reservation.id}/payment`, {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        reservation?: ReservationPaymentDetails;
        error?: string;
      };

      if (!response.ok || !data.reservation) {
        toast.error(data.error ?? "Unable to submit your payment receipt.");
        return;
      }

      setReservation(data.reservation);
      toast.success("Payment receipt sent to Binday's Diner.");
    });
  }

  const isPaid = reservation.paymentStatus === "paid";
  const isExpired = reservation.paymentStatus === "unpaid";

  return (
    <section className="bg-background px-4 py-12 sm:py-20">
      <div className="mx-auto max-w-2xl rounded-sm border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
          Binday&apos;s Diner Reservation
        </p>
        <h1 className="mt-3 font-serif text-4xl text-foreground sm:text-5xl">
          {isPaid
            ? "Payment received"
            : isExpired
              ? "Payment link expired"
              : "Complete your payment"}
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          {isPaid
            ? "Your receipt was sent to Binday's Diner. Your reservation is marked paid."
            : isExpired
              ? "No payment was submitted within 30 minutes, so this reservation is now unpaid."
              : "Pay through Maya or GCash, then upload your receipt below within 30 minutes."}
        </p>

        <div className="mt-7 rounded-sm border border-border bg-background p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Payment number
              </p>
              <p id="payment-number" className="mt-1 font-serif text-3xl text-foreground">
                {paymentNumber}
              </p>
            </div>
            <Button type="button" variant="outline" onClick={copyPaymentNumber}>
              <Copy className="size-4" />
              Copy
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Maya and GCash payments are accepted.
          </p>
        </div>

        {!isPaid && !isExpired ? (
          <section className="mt-6" aria-labelledby="payment-qr-title">
            <div className="mb-3">
              <p id="payment-qr-title" className="text-sm font-semibold text-foreground">
                Scan to pay
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Select your preferred payment app, then scan its QR code.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="overflow-hidden rounded-sm border border-border bg-background p-4">
                <p className="mb-3 text-center text-base font-bold text-[#007DFE]">
                  GCash
                </p>
                <Image
                  src="/payment/gcash.jpg"
                  alt="GCash payment QR code"
                  width={800}
                  height={800}
                  className="mx-auto h-auto w-full max-w-sm rounded-sm object-contain"
                />
              </div>
              <div className="overflow-hidden rounded-sm border border-border bg-background p-4">
                <p className="mb-3 text-center text-base font-bold text-[#00AEEF]">
                  Maya
                </p>
                <Image
                  src="/payment/maya.jpg"
                  alt="Maya payment QR code"
                  width={800}
                  height={800}
                  className="mx-auto h-auto w-full max-w-sm rounded-sm object-contain"
                />
              </div>
            </div>
          </section>
        ) : null}

        <div className="mt-6 border-y border-border py-4">
          {reservation.items.map((item) => (
            <div key={`${item.name}-${item.price}`} className="flex justify-between gap-4 py-1 text-sm">
              <span className="min-w-0 text-muted-foreground">
                {item.quantity}× {item.name}
              </span>
              <span className="shrink-0 font-semibold text-foreground">{item.price}</span>
            </div>
          ))}
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">Total</span>
            <span className="font-serif text-2xl text-foreground">P{reservation.subtotal.toLocaleString("en-PH")}</span>
          </div>
        </div>

        {isPaid ? (
          <div className="mt-7 flex items-center gap-3 rounded-sm bg-secondary px-4 py-4 text-secondary-foreground">
            <CheckCircle2 className="size-6 shrink-0" />
            <p className="text-sm font-semibold">Receipt received and sent to the diner.</p>
          </div>
        ) : isExpired ? null : (
          <form onSubmit={handleSubmit} className="mt-7">
            <label className="grid gap-2 text-sm font-semibold text-foreground">
              Upload payment receipt
              <input
                name="receipt"
                type="file"
                required
                accept="image/*,application/pdf"
                className="rounded-sm border border-input bg-background px-3 py-3 text-sm font-normal"
              />
              <span className="text-xs font-normal text-muted-foreground">
                Image or PDF, up to 8MB.
              </span>
            </label>
            <Button type="submit" disabled={isPending} className="mt-5 h-12 w-full rounded-sm text-xs font-semibold uppercase tracking-[0.08em]">
              <Upload className="size-4" />
              {isPending ? "Sending receipt..." : "Submit payment receipt"}
            </Button>
          </form>
        )}

        {!isPaid && !isExpired ? (
          <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <CreditCard className="size-4" />
            Link expires {new Date(reservation.paymentLinkExpiresAt).toLocaleString("en-PH")}.
          </p>
        ) : null}
      </div>
    </section>
  );
}
