import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import type { ManagementCategorySlug } from "@/lib/management";
import type { Campaign } from "@/lib/menu-campaigns";
import { isAblyRealtimeEnabled } from "@/lib/realtime";
import { cn } from "@/lib/utils";

import { CampaignFeatureStrip } from "./CampaignFeatureStrip";
import { MenuCard } from "./MenuCard";
import {
  ParallaxLayer,
  Reveal,
  StaggerContainer,
  StaggerItem,
} from "./MotionEffects";
import { PublicMenuRealtimeRefresh } from "./PublicMenuRealtimeRefresh";

type StudentMealsShowcaseProps = {
  campaign: Campaign;
  realtimeCategory?: ManagementCategorySlug;
  sectionId?: string;
  footerEyebrow?: string;
  footerTitle?: string;
  chooseLabel?: string;
  decorationTheme?: DecorationTheme;
};

type DecorationTheme =
  | "food"
  | "coffee"
  | "menu"
  | "promo"
  | "daily"
  | "best-seller";

type DecorationAsset = {
  src: string;
  width: number;
  height: number;
  wrapperClassName: string;
  imageClassName: string;
};

const decorationSets: Record<
  DecorationTheme,
  {
    primary: DecorationAsset;
    secondary: DecorationAsset;
    tertiary?: DecorationAsset;
  }
> = {
  food: {
    primary: {
      src: "/images/decorative-chili.png",
      width: 1536,
      height: 1024,
      wrapperClassName: "-left-10 top-10 w-64",
      imageClassName: "rotate-[65deg]",
    },
    secondary: {
      src: "/images/decorative-carrot.png",
      width: 1536,
      height: 1536,
      wrapperClassName: "-right-10 top-64 w-64",
      imageClassName: "rotate-[-16deg]",
    },
    tertiary: {
      src: "/images/decorative-scallion.png",
      width: 1536,
      height: 1024,
      wrapperClassName: "-right-20 bottom-4 w-72",
      imageClassName: "-rotate-[125deg]",
    },
  },
  coffee: {
    primary: {
      src: "/images/decorative-coffee-beans.png",
      width: 1536,
      height: 1536,
      wrapperClassName: "-left-10 top-10 w-64",
      imageClassName: "rotate-[-14deg]",
    },
    secondary: {
      src: "/images/decorative-coffee-spices.png",
      width: 1536,
      height: 1536,
      wrapperClassName: "-right-10 top-64 w-64",
      imageClassName: "rotate-[12deg]",
    },
    tertiary: {
      src: "/images/decorative-cinnamon.png",
      width: 1536,
      height: 1024,
      wrapperClassName: "-right-20 bottom-4 w-72",
      imageClassName: "rotate-[-18deg]",
    },
  },
  menu: {
    primary: {
      src: "/images/decorative-menu-oregano.png",
      width: 1024,
      height: 1536,
      wrapperClassName: "-left-10 top-12 w-48",
      imageClassName: "rotate-[28deg]",
    },
    secondary: {
      src: "/images/decorative-menu-garlic.png",
      width: 1536,
      height: 1536,
      wrapperClassName: "-right-12 top-52 w-56",
      imageClassName: "rotate-[-18deg]",
    },
  },
  promo: {
    primary: {
      src: "/images/decorative-promo-olives.png",
      width: 1536,
      height: 1024,
      wrapperClassName: "-left-10 top-20 w-56",
      imageClassName: "rotate-[14deg]",
    },
    secondary: {
      src: "/images/decorative-promo-lemon.png",
      width: 1536,
      height: 1536,
      wrapperClassName: "-right-12 top-52 w-56",
      imageClassName: "rotate-[-12deg]",
    },
  },
  daily: {
    primary: {
      src: "/images/decorative-daily-rosemary.png",
      width: 1536,
      height: 1536,
      wrapperClassName: "-left-10 top-20 w-52",
      imageClassName: "rotate-[-18deg]",
    },
    secondary: {
      src: "/images/decorative-daily-spoon.png",
      width: 1536,
      height: 1536,
      wrapperClassName: "-right-10 top-48 w-48",
      imageClassName: "rotate-[36deg]",
    },
  },
  "best-seller": {
    primary: {
      src: "/images/decorative-bestseller-tomatoes.png",
      width: 1536,
      height: 1536,
      wrapperClassName: "-left-12 top-16 w-56",
      imageClassName: "rotate-[18deg]",
    },
    secondary: {
      src: "/images/decorative-bestseller-parmesan.png",
      width: 1536,
      height: 1536,
      wrapperClassName: "-right-12 top-52 w-56",
      imageClassName: "rotate-[-14deg]",
    },
  },
};

export function StudentMealsShowcase({
  campaign,
  realtimeCategory = "student-meal",
  sectionId = "student-meals",
  footerEyebrow = "Student favorites",
  footerTitle = "Choose your meals, then continue from your food order.",
  chooseLabel = "Choose Meals",
  decorationTheme = "food",
}: StudentMealsShowcaseProps) {
  const realtimeEnabled = isAblyRealtimeEnabled();
  const decorations = decorationSets[decorationTheme];
  const useFourColumns = campaign.dishes.length === 4;

  return (
    <main className="overflow-hidden bg-background text-foreground">
      {realtimeEnabled ? (
        <PublicMenuRealtimeRefresh categories={[realtimeCategory]} />
      ) : null}

      <section
        id={sectionId}
        className="relative mx-auto w-full scroll-mt-28 px-4 pb-14 pt-10 md:pb-16 md:pt-12  xl:px-0"
      >
        <ParallaxLayer
          className="pointer-events-none absolute -left-14 top-72 hidden w-64 opacity-40 lg:block"
          distance={36}
          reverse
        >
          <Image
            src="/images/decorative-leaf.png"
            alt=""
            aria-hidden="true"
            width={1254}
            height={1254}
            className="h-auto w-full rotate-[58deg]"
          />
        </ParallaxLayer>
        <ParallaxLayer
          className="pointer-events-none absolute -right-10 top-3 hidden w-40 opacity-50 md:block"
          distance={44}
        >
          <Image
            src="/images/decorative-single-leaf.png"
            alt=""
            aria-hidden="true"
            width={1254}
            height={1254}
            className="h-auto w-full rotate-[-42deg]"
          />
        </ParallaxLayer>
        <ParallaxLayer
          className={cn(
            "pointer-events-none absolute hidden opacity-90 lg:block",
            decorations.primary.wrapperClassName,
          )}
          distance={28}
          reverse
        >
          <Image
            src={decorations.primary.src}
            alt=""
            aria-hidden="true"
            width={decorations.primary.width}
            height={decorations.primary.height}
            className={cn(
              "h-auto w-full drop-shadow-lg",
              decorations.primary.imageClassName,
            )}
          />
        </ParallaxLayer>
        <ParallaxLayer
          className={cn(
            "pointer-events-none absolute hidden opacity-85 lg:block",
            decorations.secondary.wrapperClassName,
          )}
          distance={34}
        >
          <Image
            src={decorations.secondary.src}
            alt=""
            aria-hidden="true"
            width={decorations.secondary.width}
            height={decorations.secondary.height}
            className={cn(
              "h-auto w-full drop-shadow-lg",
              decorations.secondary.imageClassName,
            )}
          />
        </ParallaxLayer>
        {decorations.tertiary ? (
          <ParallaxLayer
            className={cn(
              "pointer-events-none absolute hidden opacity-55 xl:block",
              decorations.tertiary.wrapperClassName,
            )}
            distance={48}
            reverse
          >
            <Image
              src={decorations.tertiary.src}
              alt=""
              aria-hidden="true"
              width={decorations.tertiary.width}
              height={decorations.tertiary.height}
              className={cn(
                "h-auto w-full drop-shadow-lg",
                decorations.tertiary.imageClassName,
              )}
            />
          </ParallaxLayer>
        ) : null}

        <Reveal className="relative z-10 mx-auto max-w-5xl text-center">
          <p className="font-serif text-xl italic text-brand-script sm:text-2xl">
            {campaign.eyebrow}
          </p>
          <h1 className="mt-3 font-serif text-[clamp(2.65rem,8vw,4.75rem)] leading-[0.95] text-foreground">
            {campaign.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            {campaign.description}
          </p>
          {campaign.badge ? (
            <span className="mt-4 inline-flex rounded-full bg-brand-gold-soft px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-secondary">
              {campaign.badge}
            </span>
          ) : null}
        </Reveal>

        <StaggerContainer
          revealOnMount
          className={cn(
            "relative z-10 mx-auto mt-10 grid grid-cols-1 gap-x-5 gap-y-8 sm:mt-12 sm:grid-cols-2 lg:mt-14",
            useFourColumns
              ? "max-w-6xl lg:grid-cols-4"
              : "max-w-5xl lg:grid-cols-3",
          )}
        >
          {campaign.dishes.map((dish) => (
            <StaggerItem key={dish.name} className="h-full">
              <MenuCard dish={dish} source={campaign.slug} variant="student" />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="pb-10">
        <CampaignFeatureStrip features={campaign.features} />
      </section>

      <section className="border-y border-border bg-card/55">
        <div className="mx-auto flex max-w-[98dvw] flex-col items-center justify-between gap-6 px-4 py-9 text-center md:max-w-[95dvw] lg:flex-row lg:text-left xl:max-w-[85dvw] xl:px-0">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
              {footerEyebrow}
            </p>
            <h2 className="mt-2 max-w-2xl font-serif text-3xl leading-tight text-foreground sm:text-4xl">
              {footerTitle}
            </h2>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href={`#${sectionId}`}
              className={cn(
                buttonVariants(),
                "h-11 rounded-sm px-6 text-xs font-semibold uppercase tracking-[0.08em]",
              )}
            >
              {chooseLabel}
              <ArrowRight className="size-4" />
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
    </main>
  );
}
