"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Check, Gift, Plus, X } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { AdminDialogPopup } from "@/components/admin/AdminDialog";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogDescription,
  DialogPortal,
  DialogTitle,
  DialogViewport,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import type { LoyaltyCardResponse } from "@/lib/loyalty-contracts";

type ApiResponse = {
  ok: boolean;
  card?: LoyaltyCardResponse;
  error?: string;
};

function getNextStampNumber(card: LoyaltyCardResponse) {
  return (
    Array.from({ length: card.rewardThreshold }, (_, index) => index + 1).find(
      (stampNumber) => !card.stampedNumbers.includes(stampNumber),
    ) ?? null
  );
}

export function AdminLoyaltyStampClient({
  memberCode,
}: {
  memberCode: string;
}) {
  const [card, setCard] = useState<LoyaltyCardResponse | null>(null);
  const [note, setNote] = useState("");
  const [selectedStamp, setSelectedStamp] = useState<number | null>(null);
  const [isLoadingCard, setIsLoadingCard] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [action, setAction] = useState<"stamp" | "redeem">("stamp");

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
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      } finally {
        setIsLoadingCard(false);
      }
    }

    void loadCard();
  }, [memberCode]);

  async function submitStamp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedStamp || !card) {
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
          stampNumber: selectedStamp,
          rewardCycle: card.currentCycle,
          note,
        }),
      });
      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.ok || !data.card) {
        throw new Error(data.error ?? "Unable to stamp loyalty card.");
      }

      setCard(data.card);
      setSelectedStamp(getNextStampNumber(data.card));
      setFormOpen(false);
      toast.success("Stamp added.", {
        id: toastId,
        description:
          data.card.currentCycle > card.currentCycle
            ? "10 stamps complete! A reward is ready and the card has reset to 0/10."
            : `${data.card.stampCount}/${data.card.rewardThreshold} stamps complete.`,
      });
    } catch (error) {
      toast.error("Unable to add stamp.", {
        id: toastId,
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function redeemReward() {
    const rewardCycle = card?.pendingRewardCycles[0];
    if (!rewardCycle) return;

    setIsSubmitting(true);
    const toastId = toast.loading("Redeeming reward...");

    try {
      const response = await fetch(`/api/admin/loyalty/${memberCode}/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rewardCycle,
          note,
        }),
      });
      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.ok || !data.card) {
        throw new Error(data.error ?? "Unable to redeem reward.");
      }

      setCard(data.card);
      setSelectedStamp(getNextStampNumber(data.card));
      setFormOpen(false);
      toast.success("Reward redeemed.", {
        id: toastId,
        description: "The loyalty card history was updated.",
      });
    } catch (error) {
      toast.error("Unable to redeem reward.", {
        id: toastId,
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function openAction(nextAction: "stamp" | "redeem") {
    setAction(nextAction);
    setFormOpen(true);
  }

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        title="Loyalty card"
        description="Record a customer's visit or redeem an earned reward."
      >
        <Button
          variant="outline"
          className="rounded-lg"
          render={<Link href="/management/loyalty" />}
          nativeButton={false}
        >
          <ArrowLeft />
          All members
        </Button>
      </AdminPageHeader>
      {card ? (
        <AdminPanel className="max-w-3xl p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
            <div>
              <h2 className="text-lg font-semibold">{card.member.fullName}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {card.member.memberCode}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Birthday: {card.member.birthday}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold tabular-nums">
                {card.stampCount}
                <span className="text-base text-muted-foreground">
                  {" "}
                  / {card.rewardThreshold}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Card {card.currentCycle}
              </p>
            </div>
          </div>
          <div className="my-6 grid grid-cols-5 gap-3">
            {Array.from({ length: card.rewardThreshold }, (_, index) => {
              const stampNumber = index + 1;
              const stamped = card.stampedNumbers.includes(stampNumber);
              const isNext = stampNumber === getNextStampNumber(card);
              return (
                <Button
                  key={stampNumber}
                  variant="outline"
                  disabled={!isNext}
                  aria-label={
                    stamped
                      ? `Stamp ${stampNumber} completed`
                      : `Add stamp ${stampNumber}`
                  }
                  className={`aspect-square h-auto rounded-xl border text-sm font-semibold ${stamped ? "border-brand-olive/30 bg-brand-gold-soft text-brand-olive disabled:opacity-100" : isNext ? "border-primary/40 bg-primary/5 text-primary" : "border-dashed text-muted-foreground"}`}
                  onClick={() => openAction("stamp")}
                >
                  {stamped ? <Check className="size-5" /> : stampNumber}
                </Button>
              );
            })}
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Each completed card earns a reward and automatically resets for the
            next 10 stamps.
          </p>
          {card.rewardReady && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-brand-gold-soft p-3 text-sm text-brand-olive">
              <Gift className="size-4" />
              {card.pendingRewardCount} reward
              {card.pendingRewardCount === 1 ? "" : "s"} ready to redeem
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              className="rounded-lg"
              disabled={isSubmitting || !getNextStampNumber(card)}
              onClick={() => openAction("stamp")}
            >
              <Plus />
              Add stamp
            </Button>
            <Button
              variant="outline"
              className="rounded-lg"
              disabled={isSubmitting || !card.rewardReady}
              onClick={() => openAction("redeem")}
            >
              <Gift />
              Redeem reward
            </Button>
          </div>
        </AdminPanel>
      ) : (
        <AdminPanel className="p-6">
          <p className="text-sm text-muted-foreground">
            {isLoadingCard
              ? "Retrieving loyalty card…"
              : "Loyalty card unavailable."}
          </p>
        </AdminPanel>
      )}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!isSubmitting) setFormOpen(open);
        }}
        onOpenChangeComplete={(open) => {
          if (!open) {
            setNote("");
          }
        }}
      >
        <DialogPortal>
          <DialogBackdrop />
          <DialogViewport>
            <AdminDialogPopup className="max-w-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-lg font-semibold">
                    {action === "stamp" ? "Add loyalty stamp" : "Redeem reward"}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm leading-6 text-muted-foreground">
                    {action === "stamp"
                      ? "Confirm this customer's visit to add the next stamp."
                      : "Confirm that the customer is receiving their earned reward."}
                  </DialogDescription>
                </div>
                <DialogClose
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={isSubmitting}
                    />
                  }
                  aria-label="Close loyalty dialog"
                >
                  <X />
                </DialogClose>
              </div>
              <form
                className="mt-6 grid gap-4"
                onSubmit={(event) => {
                  if (action === "stamp") void submitStamp(event);
                  else {
                    event.preventDefault();
                    void redeemReward();
                  }
                }}
              >
                <label className="grid gap-2 text-sm font-medium">
                  Receipt or note
                  <Input
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    className="rounded-lg border-border bg-background"
                    placeholder="Receipt number or order note"
                  />
                </label>
                <div className="mt-2 flex justify-end gap-2">
                  <DialogClose
                    render={
                      <Button
                        variant="outline"
                        className="rounded-lg"
                        disabled={isSubmitting}
                      />
                    }
                  >
                    Cancel
                  </DialogClose>
                  <Button
                    type="submit"
                    className="rounded-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Saving…"
                      : action === "stamp"
                        ? "Add stamp"
                        : "Redeem reward"}
                  </Button>
                </div>
              </form>
            </AdminDialogPopup>
          </DialogViewport>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
