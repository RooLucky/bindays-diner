"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { LoyaltyCardResponse } from "@/lib/loyalty-contracts";

type ApiResponse = {
  ok: boolean;
  card?: LoyaltyCardResponse;
  error?: string;
};

function getDisplayStampedNumbers(card: LoyaltyCardResponse) {
  return card.redeemed ? [] : card.stampedNumbers;
}

function getNextStampNumber(card: LoyaltyCardResponse) {
  if (card.rewardReady) {
    return null;
  }

  const stampedNumbers = getDisplayStampedNumbers(card);

  return (
    Array.from({ length: card.rewardThreshold }, (_, index) => index + 1).find(
      (stampNumber) => !stampedNumbers.includes(stampNumber),
    ) ?? null
  );
}

export function AdminLoyaltyStampClient({ memberCode }: { memberCode: string }) {
  const [card, setCard] = useState<LoyaltyCardResponse | null>(null);
  const [pin, setPin] = useState("");
  const [note, setNote] = useState("");
  const [selectedStamp, setSelectedStamp] = useState<number | null>(null);
  const [isLoadingCard, setIsLoadingCard] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCard() {
      const toastId = toast.loading("Retrieving loyalty card...");

      try {
        const response = await fetch(`/api/loyalty/${memberCode}`);
        const data = (await response.json()) as ApiResponse;

        if (!response.ok || !data.ok || !data.card) {
          throw new Error(data.error ?? "Loyalty card not found.");
        }

        setCard(data.card);
        setSelectedStamp(getNextStampNumber(data.card));
        toast.success("Loyalty card loaded.", {
          id: toastId,
          description: data.card.member.fullName,
        });
      } catch (error) {
        toast.error("Unable to retrieve loyalty card.", {
          id: toastId,
          description: error instanceof Error ? error.message : "Something went wrong.",
        });
      } finally {
        setIsLoadingCard(false);
      }
    }

    void loadCard();
  }, [memberCode]);

  async function submitStamp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedStamp) {
      toast.error("Select a stamp number first.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Adding loyalty stamp...");

    try {
      const response = await fetch(`/api/admin/loyalty/${memberCode}/stamp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pin,
          stampNumber: selectedStamp,
          note,
        }),
      });
      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.ok || !data.card) {
        throw new Error(data.error ?? "Unable to stamp loyalty card.");
      }

      setCard(data.card);
      setSelectedStamp(getNextStampNumber(data.card));
      toast.success("Stamp added.", {
        id: toastId,
        description: `${data.card.stampCount}/${data.card.rewardThreshold} stamps complete.`,
      });
    } catch (error) {
      toast.error("Unable to add stamp.", {
        id: toastId,
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function redeemReward() {
    setIsSubmitting(true);
    const toastId = toast.loading("Redeeming reward...");

    try {
      const response = await fetch(`/api/admin/loyalty/${memberCode}/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pin,
          note,
        }),
      });
      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.ok || !data.card) {
        throw new Error(data.error ?? "Unable to redeem reward.");
      }

      setCard(data.card);
      setSelectedStamp(getNextStampNumber(data.card));
      toast.success("Reward redeemed.", {
        id: toastId,
        description: "The loyalty card history was updated.",
      });
    } catch (error) {
      toast.error("Unable to redeem reward.", {
        id: toastId,
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="min-h-screen bg-background py-10">
      <div className="mx-auto max-w-[98dvw] px-4 md:max-w-[720px]">
        <div className="rounded-sm border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
          <p className="font-serif text-2xl italic text-brand-script">Admin Scan</p>
          <h1 className="mt-2 font-serif text-4xl leading-tight text-foreground">
            Loyalty Stamp
          </h1>

          {card ? (
            <>
              {(() => {
                const displayStampedNumbers = getDisplayStampedNumbers(card);
                const nextStampNumber = getNextStampNumber(card);

                return (
                  <>
              <div className="mt-6 rounded-sm border border-border bg-background p-4 text-sm leading-7">
                <p className="font-semibold text-foreground">{card.member.fullName}</p>
                <p className="text-muted-foreground">Birthday: {card.member.birthday}</p>
                <p className="text-muted-foreground">Member: {card.member.memberCode}</p>
                <p className="text-muted-foreground">
                  Stamps: {displayStampedNumbers.length}/{card.rewardThreshold}
                </p>
                {card.redeemed ? (
                  <p className="mt-2 font-semibold text-secondary">
                    Previous reward redeemed. New cycle starts at stamp 1.
                  </p>
                ) : null}
                {card.rewardReady ? (
                  <p className="mt-2 font-semibold text-primary">
                    Reward ready. Redeem before adding more stamps.
                  </p>
                ) : null}
              </div>

              <form className="mt-6 grid gap-4" onSubmit={submitStamp}>
                <div className="grid grid-cols-5 gap-3">
                  {Array.from({ length: card.rewardThreshold }, (_, index) => {
                    const stampNumber = index + 1;
                    const stamped = displayStampedNumbers.includes(stampNumber);
                    const isNextStamp = stampNumber === nextStampNumber;

                    return (
                      <button
                        key={stampNumber}
                        type="button"
                        disabled={!isNextStamp}
                        className={`grid aspect-square place-items-center rounded-full border text-sm font-semibold ${
                          stamped
                            ? "border-primary bg-primary text-primary-foreground"
                            : isNextStamp
                              ? "border-secondary bg-brand-gold-soft text-foreground"
                              : "border-primary/35 text-foreground"
                        } disabled:opacity-60`}
                        onClick={() => setSelectedStamp(stampNumber)}
                      >
                        {stampNumber}
                      </button>
                    );
                  })}
                </div>

                <label className="grid gap-2 text-sm font-medium text-foreground">
                  Admin PIN
                  <input
                    required
                    type="password"
                    value={pin}
                    onChange={(event) => setPin(event.target.value)}
                    className="h-11 rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                    placeholder="Enter stamp PIN"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-foreground">
                  Receipt or Note
                  <input
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    className="h-11 rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                    placeholder="Receipt number or order note"
                  />
                </label>

                <Button
                  type="submit"
                  className="h-12 rounded-sm text-xs font-semibold uppercase tracking-[0.08em]"
                  disabled={isSubmitting || card.rewardReady || !nextStampNumber}
                >
                  Add Stamp
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-sm bg-transparent text-xs font-semibold uppercase tracking-[0.08em]"
                  disabled={isSubmitting || !card.rewardReady}
                  onClick={redeemReward}
                >
                  Redeem Reward
                </Button>
              </form>
                  </>
                );
              })()}
            </>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              {isLoadingCard ? "Retrieving loyalty card..." : "Loyalty card unavailable."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
