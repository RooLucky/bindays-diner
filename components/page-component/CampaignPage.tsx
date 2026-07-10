import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/lib/menu-campaigns";

import { CampaignFeatureStrip } from "./CampaignFeatureStrip";
import { MenuCard } from "./MenuCard";
import { ParallaxLayer, Reveal, StaggerContainer, StaggerItem } from "./MotionEffects";

export function CampaignPage({ campaign }: { campaign: Campaign }) {
  return (
    <div className="bg-background ">
      <section className="mx-auto grid max-w-[98dvw] min-h-dvh gap-10 px-4 md:max-w-[95dvw] lg:grid-cols-[0.78fr_1.22fr] lg:items-center xl:max-w-[75dvw] xl:px-0">
        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
          <Reveal>
            <p className="font-serif text-2xl italic text-brand-script sm:text-3xl">
              {campaign.eyebrow}
            </p>
            <h1 className="mt-4 font-serif text-[clamp(2.8rem,10vw,5.4rem)] leading-[0.98] text-foreground lg:text-[clamp(4rem,5.4vw,4.5rem)]">
              {campaign.title}
            </h1>
            <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-muted-foreground sm:text-base lg:mx-0">
              {campaign.description}
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
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
          </Reveal>
        </div>

        <div className="relative">
          <div className="relative mx-auto aspect-square w-full max-w-4xl max-h-[70dvh] flex items-center justify-end overflow-hidden rounded-sm">
            {campaign.badge ? (
              <span className="absolute xl:left-60  right-4 top-3 z-20 grid size-24 place-items-center rounded-full bg-primary px-3 text-center text-sm font-bold uppercase leading-tight text-primary-foreground shadow-[var(--shadow-primary-button)] sm:right-6 sm:top-6 md:size-28">
                {campaign.badge}
              </span>
            ) : null}
            <ParallaxLayer
              className="flex h-full w-full items-center justify-end"
              distance={62}
            >
              <img
                src={campaign.heroImage}
                alt={campaign.heroAlt}
                className="lg:h-full lg:w-auto"
              />
            </ParallaxLayer>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[98dvw] px-4 py-8 md:max-w-[95dvw] xl:max-w-[85dvw] xl:px-0">
        <StaggerContainer className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {campaign.dishes.map((dish) => (
            <StaggerItem key={dish.name}>
              <MenuCard dish={dish} source={campaign.slug} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="pb-12 pt-4">
        <CampaignFeatureStrip features={campaign.features} />
      </section>

      <section className="mx-auto max-w-[98dvw] px-4 pb-20 md:max-w-[95dvw] xl:max-w-[85dvw] xl:px-0">
        <Reveal>
          <div className="flex flex-col items-center justify-between gap-6 rounded-sm border border-border bg-card px-6 py-7 text-center shadow-[var(--shadow-card)] lg:flex-row lg:items-center lg:text-left xl:px-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.08em] text-primary">
                Make it easy
              </p>
              <h2 className="mt-2 font-serif text-3xl text-foreground">
                Reserve ahead or join the loyalty list.
              </h2>
            </div>
            <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row lg:justify-start">
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
        </Reveal>
      </section>
    </div>
  );
}
