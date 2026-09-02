"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCcw, Search, Users } from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import type { AdminLoyaltyRegistration } from "@/lib/admin-loyalty";
import { cn } from "@/lib/utils";

type AdminLoyaltyResponse = {
  registrations?: AdminLoyaltyRegistration[];
  error?: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "No activity yet";
  }

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminLoyaltyRegistrationsClient() {
  const [registrations, setRegistrations] = useState<AdminLoyaltyRegistration[]>(
    [],
  );
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const filteredRegistrations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return registrations;
    }

    return registrations.filter((registration) =>
      [
        registration.fullName,
        registration.memberCode,
        registration.phone ?? "",
      ].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [query, registrations]);

  async function loadRegistrations() {
    setPending(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/loyalty", {
        cache: "no-store",
      });
      const data = (await response.json()) as AdminLoyaltyResponse;

      if (!response.ok || !data.registrations) {
        throw new Error(data.error ?? "Unable to load loyalty registrations.");
      }

      setRegistrations(data.registrations);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load loyalty registrations.",
      );
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    void loadRegistrations();
  }, []);

  return (
    <section className="rounded-sm border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="font-serif text-2xl italic text-brand-script">
            Member directory
          </p>
          <h2 className="mt-2 font-serif text-[clamp(2rem,5vw,3rem)] leading-tight text-foreground">
            Loyalty Registrations
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Review every enrolled member and open their loyalty card to add
            stamps or redeem a completed reward.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-sm bg-transparent"
          disabled={pending}
          onClick={() => void loadRegistrations()}
        >
          <RefreshCcw className={cn("size-4", pending && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="mt-6 flex flex-col justify-between gap-3 rounded-sm border border-border bg-background p-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="size-4 text-secondary" />
          <span>
            {registrations.length} registered member
            {registrations.length === 1 ? "" : "s"}
          </span>
        </div>
        <label className="relative block sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <span className="sr-only">Search loyalty members</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-full rounded-sm border border-input bg-card pl-9 pr-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
            placeholder="Search name, code, or phone"
          />
        </label>
      </div>

      {message ? (
        <p className="mt-4 rounded-sm border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {message}
        </p>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-sm border border-border">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Current card</th>
                <th className="px-4 py-3">Last activity</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {filteredRegistrations.map((registration) => (
                <tr key={registration.memberCode}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-foreground">
                      {registration.fullName}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {registration.memberCode}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    <p>{registration.phone ?? "No phone supplied"}</p>
                    <p className="mt-1 text-xs">Birthday: {registration.birthday}</p>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {formatDate(registration.createdAt)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {registration.stampCount}/{registration.rewardThreshold} stamps
                      </span>
                      {registration.rewardReady ? (
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                          Reward ready
                        </span>
                      ) : registration.redeemed ? (
                        <span className="rounded-full bg-secondary/10 px-2 py-1 text-xs font-semibold text-secondary">
                          Redeemed
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Cycle {registration.currentCycle}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {formatDateTime(registration.lastActivityAt)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/loyalty/scan/${encodeURIComponent(registration.memberCode)}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                        className: "rounded-sm bg-transparent",
                      })}
                    >
                      Open card
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid divide-y divide-border md:hidden">
          {filteredRegistrations.map((registration) => (
            <article key={registration.memberCode} className="grid gap-4 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">
                    {registration.fullName}
                  </h3>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {registration.memberCode}
                  </p>
                </div>
                {registration.rewardReady ? (
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                    Reward ready
                  </span>
                ) : registration.redeemed ? (
                  <span className="rounded-full bg-secondary/10 px-2 py-1 text-xs font-semibold text-secondary">
                    Redeemed
                  </span>
                ) : null}
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Card
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {registration.stampCount}/{registration.rewardThreshold} stamps
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Phone
                  </dt>
                  <dd className="mt-1 break-words text-foreground">
                    {registration.phone ?? "Not supplied"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Joined
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {formatDate(registration.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Activity
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {formatDateTime(registration.lastActivityAt)}
                  </dd>
                </div>
              </dl>

              <Link
                href={`/admin/loyalty/scan/${encodeURIComponent(registration.memberCode)}`}
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full rounded-sm bg-transparent",
                })}
              >
                Open loyalty card
                <ExternalLink className="size-4" />
              </Link>
            </article>
          ))}
        </div>

        {!pending && filteredRegistrations.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {registrations.length === 0
              ? "No loyalty registrations yet."
              : "No members match that search."}
          </div>
        ) : null}
      </div>
    </section>
  );
}
