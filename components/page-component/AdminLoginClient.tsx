"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole, LogIn, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AdminLoginClient() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    const data = (await response.json()) as { error?: string };

    setPending(false);

    if (!response.ok) {
      setMessage(data.error ?? "Unable to log in.");
      return;
    }

    router.push("/management/meal-of-the-day");
    router.refresh();
  }

  return (
    <main className="relative grid min-h-dvh overflow-hidden bg-brand-cream px-4 py-6 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute -left-24 top-[-7rem] size-72 rounded-full bg-brand-gold/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 size-96 rounded-full bg-brand-red/10 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-sm border border-border bg-card shadow-[var(--shadow-card)] md:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative overflow-hidden bg-brand-olive px-7 py-8 text-brand-white sm:px-10 sm:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(255,255,255,0.15),transparent_28%),linear-gradient(145deg,transparent_30%,rgba(0,0,0,0.18))]" />
          <div className="relative flex h-full flex-col">
            <Link
              href="/home"
              className="inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-brand-white/75 transition hover:text-brand-white"
            >
              <ArrowLeft className="size-4" />
              Back to website
            </Link>
            <div className="mt-10 flex flex-col items-center md:mt-14">
              <span className="grid aspect-square w-full max-w-[19rem] place-items-center rounded-sm bg-brand-white p-5 shadow-2xl shadow-black/20 sm:max-w-[22rem]">
                <Image
                  src="/images/web-logo.png"
                  alt="Binday's Diner"
                  width={1254}
                  height={1254}
                  className="size-full object-contain"
                  priority
                />
              </span>
              {/* <div className="mt-5 text-center">
                <p className="font-serif text-3xl leading-none sm:text-4xl">Binday&apos;s Diner</p>
                <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-brand-white/70">
                  Legazpi City
                </p>
              </div> */}
            </div>
            <div className="mt-10 max-w-sm md:mt-auto">
              {/* <p className="font-serif text-3xl leading-tight sm:text-4xl">
                Restaurant management, all in one place.
              </p> */}
              <p className="mt-4 text-sm leading-7 text-brand-white/75">
                Manage menu content, featured offerings, promotions, and
                customer-facing updates from your secure dashboard.
              </p>
              <div className="mt-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.08em] text-brand-white/80">
                <ShieldCheck className="size-5" />
                Authorized staff access
              </div>
            </div>
          </div>
        </aside>

        <section className="flex items-center px-6 py-9 sm:px-10 sm:py-12">
          <form onSubmit={submitLogin} className="mx-auto w-full max-w-sm">
            <span className="grid size-11 place-items-center rounded-full bg-brand-gold-soft text-primary">
              <LockKeyhole className="size-5" />
            </span>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Restaurant administration
            </p>
            <h1 className="mt-2 font-serif text-4xl text-foreground sm:text-5xl">
              Access your dashboard
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Enter your authorized account details to continue.
            </p>
            <div className="mt-8 grid gap-5">
              <label className="grid gap-2 text-sm font-semibold text-foreground">
                Email address
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="h-12 rounded-sm border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus-visible:ring-3 focus-visible:ring-ring/30"
                  placeholder="admin@bindaysdiner.com"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-foreground">
                Password
                <input
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="h-12 rounded-sm border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus-visible:ring-3 focus-visible:ring-ring/30"
                  placeholder="Enter your password"
                />
              </label>
            </div>
            {message ? (
              <p
                role="alert"
                className="mt-5 rounded-sm border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              >
                {message}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={pending}
              className="mt-7 h-12 w-full rounded-sm text-xs font-semibold uppercase tracking-[0.1em]"
            >
              <LogIn className="size-4" />
              {pending ? "Signing in..." : "Access dashboard"}
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
