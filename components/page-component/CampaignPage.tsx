import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/lib/menu-campaigns";

import { CampaignFeatureStrip } from "./CampaignFeatureStrip";
import { MenuCard } from "./MenuCard";

export function CampaignPage({ campaign }: { campaign: Campaign }) {
  return (
    <div className="bg-background">
      <section className="mx-auto grid max-w-[98dvw] gap-10 px-4 pb-12 pt-8 md:max-w-[95dvw] lg:grid-cols-[0.78fr_1.22fr] lg:items-center xl:max-w-[85dvw] xl:px-0">
        <div className="max-w-xl text-center sm:text-left">
          <p className="font-serif text-2xl italic text-brand-script sm:text-3xl">
            {campaign.eyebrow}
          </p>
          <h1 className="mt-4 font-serif text-[clamp(2.8rem,10vw,5.4rem)] leading-[0.98] text-foreground lg:text-[clamp(4rem,5.4vw,5.8rem)]">
            {campaign.title}
          </h1>
          <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-muted-foreground sm:mx-0 sm:text-base">
            {campaign.description}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href={campaign.ctaHref}
              className={cn(
                buttonVariants(),
                "h-12 w-full rounded-sm px-8 text-xs font-semibold uppercase tracking-[0.08em] shadow-[var(--shadow-primary-button)] sm:w-auto",
              )}
            >
              {campaign.ctaLabel}
              <ArrowRight className="size-4" />
            </Link>
            <Button
              variant="outline"
              className="h-12 w-full rounded-sm border-border bg-transparent px-7 text-xs font-semibold uppercase tracking-[0.08em] text-foreground hover:bg-muted sm:w-auto"
            >
              View Offers
            </Button>
          </div>
        </div>

        <div className="relative">
          {campaign.badge ? (
            <span className="absolute left-3 top-6 z-20 grid size-24 place-items-center rounded-full bg-primary text-center text-sm font-bold uppercase leading-tight text-primary-foreground shadow-[var(--shadow-primary-button)] md:left-0 md:size-28">
              {campaign.badge}
            </span>
          ) : null}
          <div className="relative mx-auto aspect-[1.75/1] w-full max-w-4xl overflow-hidden rounded-sm">
            <Image
              src={campaign.heroImage}
              alt={campaign.heroAlt}
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 96vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[98dvw] px-4 py-8 md:max-w-[95dvw] xl:max-w-[85dvw] xl:px-0">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {campaign.dishes.map((dish) => (
            <MenuCard key={dish.name} dish={dish} />
          ))}
        </div>
      </section>

      <section className="pb-12 pt-4">
        <CampaignFeatureStrip features={campaign.features} />
      </section>

      <section className="mx-auto max-w-[98dvw] px-4 pb-20 md:max-w-[95dvw] xl:max-w-[85dvw] xl:px-0">
        <div className="flex flex-col items-start justify-between gap-6 rounded-sm border border-border bg-card px-6 py-7 shadow-[var(--shadow-card)] md:flex-row md:items-center md:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-primary">
              Make it easy
            </p>
            <h2 className="mt-2 font-serif text-3xl text-foreground">
              Reserve ahead or join the loyalty list.
            </h2>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/reservations"
              className={cn(
                buttonVariants(),
                "h-11 rounded-sm px-6 text-xs font-semibold uppercase tracking-[0.08em]",
              )}
            >
              Book a Table
            </Link>
            <Link
              href="/loyalty"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 rounded-sm bg-transparent px-6 text-xs font-semibold uppercase tracking-[0.08em]",
              )}
            >
              Loyalty Card
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

