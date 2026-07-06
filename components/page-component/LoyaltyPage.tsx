import { Gift, TicketPercent, Trophy } from "lucide-react";

import { LoyaltyClient } from "./LoyaltyClient";

const loyaltyPerks = [
  {
    icon: Gift,
    title: "Birthday Treats",
    description: "Store birthdays for future birthday promos.",
  },
  {
    icon: TicketPercent,
    title: "Exclusive Offers",
    description: "Send member-only discounts and food rewards.",
  },
  {
    icon: Trophy,
    title: "Visit Rewards",
    description: "A simple foundation for a rewards program.",
  },
];

export function LoyaltyPage() {
  return (
    <section className="bg-background py-12 lg:py-20">
      <div className="mx-auto grid max-w-[98dvw] gap-10 px-4 md:max-w-[95dvw] lg:grid-cols-[0.82fr_1.18fr] lg:items-center xl:max-w-[85dvw] xl:px-0">
        <div>
          <p className="font-serif text-2xl italic text-brand-script sm:text-3xl">
            Join Our Family
          </p>
          <h1 className="mt-4 font-serif text-[clamp(3rem,10vw,5.6rem)] leading-[0.98] text-foreground">
            Loyalty Card Eat More, Earn More
          </h1>
          <p className="mt-6 max-w-md text-base leading-8 text-muted-foreground">
            Save customer names and birthdays so the diner can send birthday
            rewards, promo updates, and future member perks.
          </p>
        </div>

        <LoyaltyClient />
      </div>

      <div className="mx-auto mt-12 grid max-w-[98dvw] grid-cols-1 border-y border-border px-4 md:max-w-[95dvw] md:grid-cols-3 xl:max-w-[85dvw] xl:px-0">
        {loyaltyPerks.map((perk) => {
          const Icon = perk.icon;

          return (
            <div key={perk.title} className="flex gap-4 py-6 md:px-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-gold-soft text-secondary">
                <Icon className="size-6" />
              </span>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-foreground">
                  {perk.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {perk.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
