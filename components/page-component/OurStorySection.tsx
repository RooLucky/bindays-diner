import Image from "next/image";
import {
  ChefHat,
  HandHeart,
  HeartHandshake,
  ShieldCheck,
  Star,
  Telescope,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  BINDAYS_CORE_VALUES,
  BINDAYS_MISSION,
  BINDAYS_MOTTO,
  BINDAYS_STORY_PARAGRAPHS,
  BINDAYS_VISION,
} from "@/lib/brand-content";

import {
  ParallaxLayer,
  Reveal,
  StaggerContainer,
  StaggerItem,
} from "./MotionEffects";
import { StoryLogoHologram } from "./StoryLogoHologram";

const valueIcons = {
  Hospitality: HeartHandshake,
  Quality: ChefHat,
  Integrity: ShieldCheck,
  Family: Users,
  Community: HandHeart,
  Excellence: Star,
} satisfies Record<(typeof BINDAYS_CORE_VALUES)[number]["title"], LucideIcon>;

const storyBody = BINDAYS_STORY_PARAGRAPHS.slice(3, -3);
const storyClosing = BINDAYS_STORY_PARAGRAPHS.slice(-3);

export function OurStorySection() {
  return (
    <section
      id="our-story"
      aria-labelledby="our-story-title"
      className="relative scroll-mt-24 overflow-clip border-y border-border bg-card/40 py-16 text-foreground lg:py-24"
    >
      <ParallaxLayer
        className="pointer-events-none absolute -left-16 top-32 hidden w-56 opacity-70 lg:block"
        distance={34}
        reverse
      >
        <Image
          src="/images/decorative-daily-rosemary.png"
          alt=""
          aria-hidden="true"
          width={1536}
          height={1536}
          className="h-auto w-full -rotate-[24deg] drop-shadow-lg"
        />
      </ParallaxLayer>
      <ParallaxLayer
        className="pointer-events-none absolute -right-16 top-[28rem] hidden w-52 opacity-65 lg:block"
        distance={42}
      >
        <Image
          src="/images/decorative-daily-spoon.png"
          alt=""
          aria-hidden="true"
          width={1536}
          height={1536}
          className="h-auto w-full rotate-[32deg] drop-shadow-lg"
        />
      </ParallaxLayer>
      <ParallaxLayer
        className="pointer-events-none absolute -bottom-20 right-[4%] hidden w-64 opacity-45 xl:block"
        distance={48}
        reverse
      >
        <Image
          src="/images/decorative-single-leaf.png"
          alt=""
          aria-hidden="true"
          width={1254}
          height={1254}
          className="h-auto w-full rotate-[-112deg]"
        />
      </ParallaxLayer>

      <div className="relative z-10 mx-auto max-w-[98dvw] px-4 md:max-w-[95dvw] xl:max-w-[85dvw] xl:px-0">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="font-serif text-2xl italic text-brand-script sm:text-3xl">
            - From Our Family to Yours -
          </p>
          <h2
            id="our-story-title"
            className="mt-3 font-serif text-4xl leading-tight sm:text-5xl md:text-6xl"
          >
            Our Story
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
            A dream built around Filipino food, family, and the comfort of
            sharing a table together.
          </p>
          <span className="mx-auto mt-6 block h-px w-24 bg-secondary/45" />
        </Reveal>

        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16 xl:gap-24">
          <StoryLogoHologram />

          <article className="max-w-3xl">
            <Reveal>
              <p className="font-serif text-2xl leading-relaxed text-foreground sm:text-3xl">
                {BINDAYS_STORY_PARAGRAPHS[0]}
              </p>
              <p className="mt-6 text-base leading-8 text-muted-foreground">
                {BINDAYS_STORY_PARAGRAPHS[1]}
              </p>
              <blockquote className="my-8 border-l-2 border-primary pl-5 font-serif text-xl italic leading-relaxed text-secondary sm:text-2xl">
                {BINDAYS_STORY_PARAGRAPHS[2]}
              </blockquote>
            </Reveal>

            <StaggerContainer className="space-y-6">
              {storyBody.map((paragraph) => (
                <StaggerItem key={paragraph}>
                  <p className="text-base leading-8 text-muted-foreground">
                    {paragraph}
                  </p>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <Reveal delay={0.08}>
              <div className="mt-8 border-y border-secondary/20 py-7">
                {storyClosing.map((paragraph, index) => (
                  <p
                    key={paragraph}
                    className={
                      index === storyClosing.length - 1
                        ? "mt-4 font-serif text-2xl italic leading-relaxed text-primary sm:text-3xl"
                        : "mt-2 text-base leading-8 text-foreground first:mt-0"
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </Reveal>
          </article>
        </div>

        <StaggerContainer className="mt-16 grid gap-6 lg:mt-24 lg:grid-cols-2">
          <StaggerItem className="h-full">
            <PurposeCard
              eyebrow="What Guides Us"
              title="Our Mission"
              description={BINDAYS_MISSION}
              icon={HeartHandshake}
            />
          </StaggerItem>
          <StaggerItem className="h-full">
            <PurposeCard
              eyebrow="Where We Are Going"
              title="Our Vision"
              description={BINDAYS_VISION}
              icon={Telescope}
            />
          </StaggerItem>
        </StaggerContainer>

        <div className="mt-16 lg:mt-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              The Heart of Binday&apos;s
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
              Our Core Values
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-muted-foreground">
              The promises we bring to every plate, every guest, and every
              community we serve.
            </p>
          </Reveal>

          <StaggerContainer className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BINDAYS_CORE_VALUES.map((value, index) => {
              const Icon = valueIcons[value.title];

              return (
                <StaggerItem key={value.title} className="h-full">
                  <article className="group relative h-full overflow-hidden rounded-lg border border-border bg-background/90 p-6 shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-1 hover:border-secondary/30 sm:p-7">
                    <span
                      aria-hidden="true"
                      className="absolute right-5 top-3 font-serif text-6xl leading-none text-brand-gold-soft"
                    >
                      0{index + 1}
                    </span>
                    <span className="relative flex size-14 items-center justify-center rounded-full bg-brand-gold-soft text-secondary shadow-[var(--shadow-soft-icon)] transition-transform duration-500 group-hover:scale-110">
                      <Icon className="size-7" strokeWidth={1.8} />
                    </span>
                    <h3 className="relative mt-5 font-serif text-2xl text-foreground">
                      {value.title}
                    </h3>
                    <p className="relative mt-3 text-sm leading-7 text-muted-foreground">
                      {value.description}
                    </p>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>

        <Reveal className="mt-16 lg:mt-24">
          <div className="relative overflow-hidden rounded-lg bg-secondary px-6 py-10 text-center shadow-[var(--shadow-hero-image)] sm:px-10 sm:py-12">
            <Image
              src="/images/decorative-menu-oregano.png"
              alt=""
              aria-hidden="true"
              width={1024}
              height={1536}
              className="pointer-events-none absolute -bottom-32 -left-14 hidden w-52 rotate-[38deg] opacity-20 sm:block"
            />
            <Image
              src="/images/decorative-menu-garlic.png"
              alt=""
              aria-hidden="true"
              width={1536}
              height={1536}
              className="pointer-events-none absolute -right-14 -top-20 hidden w-48 rotate-[-22deg] opacity-20 sm:block"
            />
            <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-brand-gold-soft">
              Our Promise
            </p>
            <p className="relative mx-auto mt-3 max-w-4xl font-serif text-3xl italic leading-tight text-brand-white sm:text-4xl md:text-5xl">
              “{BINDAYS_MOTTO}”
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PurposeCard({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <article className="relative h-full overflow-hidden rounded-lg border border-border bg-background/90 p-7 shadow-[var(--shadow-card)] sm:p-9">
      <div className="absolute -right-12 -top-12 size-40 rounded-full bg-brand-gold-soft/70" />
      <span className="relative flex size-16 items-center justify-center rounded-full bg-brand-gold-soft text-secondary shadow-[var(--shadow-soft-icon)]">
        <Icon className="size-8" strokeWidth={1.7} />
      </span>
      <p className="relative mt-7 text-xs font-bold uppercase tracking-[0.14em] text-primary">
        {eyebrow}
      </p>
      <h3 className="relative mt-2 font-serif text-3xl text-foreground sm:text-4xl">
        {title}
      </h3>
      <p className="relative mt-5 text-base leading-8 text-muted-foreground">
        {description}
      </p>
    </article>
  );
}
