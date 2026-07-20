"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { HeartHandshake } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import type { LoyaltyCardResponse } from "@/lib/loyalty-contracts";

import { LoyaltyQrCode } from "./LoyaltyQrCode";

type Mode = "join" | "search";

type LoyaltyApiResponse = {
  ok: boolean;
  status?: "created" | "existing";
  card?: LoyaltyCardResponse;
  error?: string;
};

const emptyForm = {
  fullName: "",
  birthday: "",
  phone: "",
};

const loyaltyStorageKey = "bindays-loyalty-member";
const birthdayStartMonth = new Date(1920, 0);
const birthdayEndMonth = new Date();

type StoredLoyaltyMember = typeof emptyForm;

function getStoredLoyaltyMember() {
  try {
    const stored = window.localStorage.getItem(loyaltyStorageKey);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as Partial<StoredLoyaltyMember>;

    if (!parsed.fullName || !parsed.birthday) {
      return null;
    }

    return {
      fullName: parsed.fullName,
      birthday: parsed.birthday,
      phone: parsed.phone ?? "",
    };
  } catch {
    return null;
  }
}

function saveStoredLoyaltyMember(member: StoredLoyaltyMember) {
  window.localStorage.setItem(
    loyaltyStorageKey,
    JSON.stringify({
      fullName: member.fullName.trim(),
      birthday: member.birthday,
      phone: member.phone.trim(),
    }),
  );
}

export function LoyaltyClient() {
  const [mode, setMode] = useState<Mode>("join");
  const [form, setForm] = useState(emptyForm);
  const [card, setCard] = useState<LoyaltyCardResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasLoadedStoredMember = useRef(false);

  async function loadLoyaltyCard(input: StoredLoyaltyMember, requestMode: Mode) {
    setIsSubmitting(true);
    const toastId = toast.loading(
      requestMode === "join"
        ? "Creating loyalty card..."
        : "Searching loyalty account...",
    );

    try {
      const response = await fetch(
        requestMode === "join" ? "/api/loyalty/register" : "/api/loyalty/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        },
      );
      const data = (await response.json()) as LoyaltyApiResponse;

      if (!response.ok || !data.ok || !data.card) {
        throw new Error(data.error ?? "Unable to load loyalty account.");
      }

      setCard(data.card);
      setForm(input);
      saveStoredLoyaltyMember(input);
      toast.success(
        data.status === "existing"
          ? "Existing loyalty account found."
          : requestMode === "join"
            ? "Loyalty card created."
            : "Loyalty account found.",
        {
          id: toastId,
          description: "Your QR card is ready.",
        },
      );
    } catch (error) {
      setCard(null);
      toast.error("Loyalty request failed.", {
        id: toastId,
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (hasLoadedStoredMember.current) {
      return;
    }

    hasLoadedStoredMember.current = true;
    const storedMember = getStoredLoyaltyMember();

    if (!storedMember) {
      return;
    }

    setMode("search");
    setForm(storedMember);
    void loadLoyaltyCard(storedMember, "search");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const input = {
      fullName: form.fullName.trim(),
      birthday: form.birthday,
      phone: form.phone.trim(),
    };

    if (!input.fullName || !input.birthday) {
      toast.error("Name and birthday are required.");
      return;
    }

    await loadLoyaltyCard(input, mode);
  }

  return (
    <div className="rounded-sm border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
      <div className="grid grid-cols-2 gap-2 rounded-sm bg-background p-1">
        <button
          type="button"
          className={`h-10 rounded-sm text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
            mode === "join"
              ? "bg-primary text-primary-foreground"
              : "text-foreground"
          }`}
          onClick={() => {
            setMode("join");
            setCard(null);
          }}
        >
          Join Now
        </button>
        <button
          type="button"
          className={`h-10 rounded-sm text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
            mode === "search"
              ? "bg-primary text-primary-foreground"
              : "text-foreground"
          }`}
          onClick={() => {
            setMode("search");
            setCard(null);
          }}
        >
          Search Existing
        </button>
      </div>

      <div className="mt-6 rounded-sm border border-primary/25 bg-background p-6 text-center">
        <HeartHandshake className="mx-auto size-10 text-secondary" />
        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Binday's Diner
        </p>
        <h2 className="mt-2 font-serif text-4xl text-primary">Loyalty Card</h2>
        <div className="mt-6 grid grid-cols-5 gap-3">
          {Array.from({ length: card?.rewardThreshold ?? 10 }, (_, index) => {
            const stampNumber = index + 1;
            const stamped = card?.stampedNumbers.includes(stampNumber);

            return (
              <span
                key={stampNumber}
                className={`grid aspect-square place-items-center rounded-full border text-sm font-semibold ${
                  stamped
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-primary/35 text-foreground"
                }`}
              >
                {stampNumber}
              </span>
            );
          })}
        </div>
      </div>

      {card ? (
        <div className="mt-6 grid gap-5">
          <div className="rounded-sm border border-border bg-background p-4 text-sm leading-7">
            <p className="font-semibold text-foreground">
              {card.member.fullName}
            </p>
            <p className="text-muted-foreground">
              Birthday: {card.member.birthday}
            </p>
            <p className="text-muted-foreground">
              Member: {card.member.memberCode}
            </p>
            <p className="text-muted-foreground">
              Stamps: {card.stampCount}/{card.rewardThreshold}
            </p>
            {card.rewardReady ? (
              <p className="mt-2 font-semibold text-primary">
                Reward ready for redemption.
              </p>
            ) : null}
          </div>
          <LoyaltyQrCode
            data={card.qrUrl}
            memberCode={card.member.memberCode}
          />
        </div>
      ) : (
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Full Name
            <input
              required
              value={form.fullName}
              onChange={(event) =>
                setForm((value) => ({ ...value, fullName: event.target.value }))
              }
              className="h-11 rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
              placeholder="Enter customer name"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Birthday
            <DatePicker
              value={form.birthday}
              onChange={(birthday) =>
                setForm((value) => ({ ...value, birthday }))
              }
              placeholder="Select birthday"
              captionLayout="dropdown"
              startMonth={birthdayStartMonth}
              endMonth={birthdayEndMonth}
              disabledDates={{ after: birthdayEndMonth }}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Phone{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
            <input
              value={form.phone}
              onChange={(event) =>
                setForm((value) => ({ ...value, phone: event.target.value }))
              }
              className="h-11 rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
              placeholder="Enter phone number"
            />
          </label>
          <Button
            type="submit"
            className="h-12 rounded-sm text-xs font-semibold uppercase tracking-[0.08em]"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? mode === "join"
                ? "Creating..."
                : "Searching..."
              : mode === "join"
                ? "Join Now"
                : "Search Existing Account"}
          </Button>
        </form>
      )}
    </div>
  );
}
