import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { BINDAYS_MOTTO } from "@/lib/brand-content";
import { cn } from "@/lib/utils";

import { ParallaxLayer, Reveal } from "./MotionEffects";

const decorativeIngredients = [
  {
    src: "/images/decorative-scallion.png",
    width: 1536,
    height: 1024,
    sizes: "(max-width: 1023px) 22vw, 138px",
    className: "-left-[14%] top-[9%] w-[36%] -rotate-[50deg]",
  },
  {
    src: "/images/decorative-daily-rosemary.png",
    width: 1280,
    height: 1280,
    sizes: "(max-width: 1023px) 20vw, 126px",
    className: "-right-[16%] top-[22%] w-[25%] rotate-[50deg]",
  },
  {
    src: "/images/decorative-leaf.png",
    width: 1280,
    height: 1280,
    sizes: "(max-width: 1023px) 16vw, 100px",
    className: "bottom-[3%] -right-[1%] w-[17%] rotate-[138deg]",
  },
  {
    src: "/images/decorative-single-leaf.png",
    width: 2254,
    height: 2254,
    sizes: "(max-width: 1023px) 12vw, 72px",
    className: "bottom-[12%] -left-[12%] w-[14%] rotate-[-108deg]",
  },
] as const;

export function HeroPage() {
  return (
    <section className="overflow-hidden bg-background text-foreground">
      <div className="mx-auto grid min-h-[calc(100dvh-84px)] w-full max-w-[98dvw] items-center gap-8 px-4 md:max-w-[95dvw] lg:grid-cols-[0.84fr_1.16fr] xl:max-w-[85dvw] xl:min-h-dvh xl:px-0">
        <div className="relative z-10 mx-auto max-w-[560px] text-center lg:mx-0 lg:text-left">
          <Reveal>
            <p className="font-serif text-2xl italic text-brand-script sm:text-3xl">
              Mabuhay!
            </p>
            <h1 className="mt-4 font-serif text-[clamp(2.4rem,8.2vw,5.75rem)] leading-[0.98] tracking-normal text-foreground sm:mt-5">
              <span className="lg:hidden">
                <span className="block">Every Meal Feels</span>
                <span className="block">
                  Like <span className="text-primary">Home</span>
                </span>
              </span>
              <span className="hidden lg:inline">
                {BINDAYS_MOTTO.replace(" Home", "")}
              </span>
              <span className="hidden text-primary lg:block">Home</span>
            </h1>
            <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-muted-foreground sm:mt-7 sm:text-base lg:mx-0">
              Comforting Filipino favorites cooked fresh, served generously,
              and made for sharing with family and friends.
            </p>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start">
              <Link
                href="/menu"
                className={cn(
                  buttonVariants(),
                  "h-12 w-full rounded-sm px-8 text-xs font-semibold uppercase tracking-[0.08em] shadow-[var(--shadow-primary-button)] sm:w-auto",
                )}
              >
                Explore the Menu
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/meal-of-the-day"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-12 w-full rounded-sm border-border bg-transparent px-7 text-xs font-semibold uppercase tracking-[0.08em] text-foreground hover:bg-muted sm:w-auto",
                )}
              >
                <Sparkles className="size-5 text-secondary" />
                Today&apos;s Special
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="relative mx-auto flex w-full items-center justify-center lg:min-h-[520px] lg:justify-end">
          <ParallaxLayer
            className="absolute left-4 top-4 hidden size-28 rounded-full border border-primary/35 text-primary md:grid md:place-items-center xl:size-32"
            distance={34}
            reverse
          >
            <div className="grid size-full place-items-center">
              <div className="grid size-24 place-items-center rounded-full border border-primary/25 text-center text-[0.58rem] font-semibold uppercase tracking-[0.22em]">
                Lutong Bahay
              </div>
            </div>
          </ParallaxLayer>
          <div className="absolute right-2 top-0 hidden size-28 rounded-full bg-popover/70 shadow-[var(--shadow-hero-orb)] lg:block" />
          <div className="absolute bottom-12 left-36 hidden h-56 w-32 rotate-[-28deg] rounded-sm bg-brand-highlight/55 lg:block" />

          <ParallaxLayer
            className="w-full max-w-[520px] lg:max-w-[560px]"
            distance={72}
          >
            <div className="relative isolate aspect-square w-full">
              <div className="hero-leaf-orbit absolute inset-0 z-0">
                {decorativeIngredients.map((ingredient) => (
                  <Image
                    key={ingredient.src}
                    src={ingredient.src}
                    alt=""
                    aria-hidden="true"
                    width={ingredient.width}
                    height={ingredient.height}
                    sizes={ingredient.sizes}
                    className={`pointer-events-none absolute z-0 h-auto select-none object-contain drop-shadow-[var(--shadow-card)] ${ingredient.className}`}
                  />
                ))}
              </div>

              <div className="hero-bowl-rotation absolute inset-0 z-10">
                <Image
                  src="/images/friedrice.png"
                  alt="A bowl of Filipino fried rice garnished with herbs and lemon"
                  width={728}
                  height={728}
                  priority
                  sizes="(max-width: 1023px) 92vw, 560px"
                  className="h-auto w-full object-contain drop-shadow-[var(--shadow-hero-image)]"
                />
              </div>

              <div
                className="pointer-events-none absolute left-1/2 top-[8%] z-20 h-[38%] w-[38%] -translate-x-1/2"
                aria-hidden="true"
              >
                <span className="hero-steam-wisp absolute bottom-0 left-[18%] h-28 w-10 rounded-full bg-background/70 blur-xl [--steam-drift:-1.5rem]" />
                <span className="hero-steam-wisp absolute bottom-[4%] left-[42%] h-32 w-12 rounded-full bg-background/65 blur-2xl [--steam-drift:1rem]" />
                <span className="hero-steam-wisp absolute bottom-0 right-[12%] h-24 w-9 rounded-full bg-background/60 blur-xl [--steam-drift:1.75rem]" />
                <span className="hero-steam-wisp absolute bottom-[10%] left-[32%] h-20 w-8 rounded-full bg-background/55 blur-lg [--steam-drift:-0.5rem]" />
              </div>
            </div>
          </ParallaxLayer>
        </div>
      </div>
    </section>
  );
}
