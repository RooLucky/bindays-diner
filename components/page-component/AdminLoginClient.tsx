"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

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
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-10">
      <form
        onSubmit={submitLogin}
        className="w-full max-w-sm rounded-sm border border-border bg-card p-6 shadow-[var(--shadow-card)]"
      >
        <p className="font-serif text-2xl italic text-brand-script">
          Bindays Admin
        </p>
        <h1 className="mt-2 font-serif text-4xl text-foreground">Sign in</h1>
        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Email
            <input
              name="email"
              type="email"
              required
              className="h-11 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-foreground">
            Password
            <input
              name="password"
              type="password"
              required
              className="h-11 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>
        {message ? (
          <p className="mt-4 text-sm text-destructive">{message}</p>
        ) : null}
        <Button
          type="submit"
          disabled={pending}
          className="mt-6 h-11 w-full rounded-sm"
        >
          <LogIn className="size-4" />
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </main>
  );
}
