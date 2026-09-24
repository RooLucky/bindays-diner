import type { Metadata } from "next";
import { Mail, MessageSquare, Phone } from "lucide-react";

import { CONCERN_CONTACT, STORE_CONTACT } from "@/lib/contact-details";

export const metadata: Metadata = {
  title: "Concerns | Binday's Diner",
  description: "Contact Binday's Diner by email or phone for any concern.",
};

export default function ConcernPage() {
  return (
    <section className="bg-background px-6 py-12 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <MessageSquare className="size-10 text-secondary" aria-hidden="true" />
        <p className="mt-5 font-serif text-2xl italic text-brand-script">
          We&apos;re here to help
        </p>
        <h1 className="mt-3 font-serif text-5xl leading-tight text-foreground sm:text-6xl">
          Have a concern?
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
          For any concern about your order, visit, or experience at Binday&apos;s
          Diner, reach out by email or phone. Please include the details of your
          concern and your order reference, if you have one, so we can help.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a
            href={CONCERN_CONTACT.emailHref}
            className="min-w-0 rounded-sm border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            <Mail className="size-6 text-secondary" aria-hidden="true" />
            <h2 className="mt-4 text-sm font-bold uppercase tracking-[0.08em] text-foreground">
              Email your concern
            </h2>
            <p className="mt-3 break-words text-sm leading-7 text-primary">
              {CONCERN_CONTACT.email}
            </p>
          </a>
          <a
            href={CONCERN_CONTACT.phoneHref}
            className="rounded-sm border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            <Phone className="size-6 text-secondary" aria-hidden="true" />
            <h2 className="mt-4 text-sm font-bold uppercase tracking-[0.08em] text-foreground">
              Call about a concern
            </h2>
            <p className="mt-3 text-sm leading-7 text-primary">
              {CONCERN_CONTACT.phone}
            </p>
          </a>
        </div>

        <p className="mt-8 text-sm leading-7 text-muted-foreground">
          For general store inquiries, call{" "}
          <a className="font-semibold text-primary underline underline-offset-4" href={STORE_CONTACT.phoneHref}>
            {STORE_CONTACT.phone}
          </a>.
        </p>
      </div>
    </section>
  );
}
