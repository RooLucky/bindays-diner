import Image from "next/image";
import { ArrowRight, CirclePlay } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ParallaxLayer, Reveal } from "./MotionEffects";

export function HeroPage() {
  return (
    <section className="overflow-hidden bg-background text-foreground">
      <div className="mx-auto grid min-h-[calc(100dvh-84px)] w-full max-w-[98dvw] items-center gap-8 px-4 md:max-w-[95dvw] lg:grid-cols-[0.84fr_1.16fr] xl:max-w-[85dvw] xl:min-h-dvh xl:px-0">
        <div className="relative z-10 mx-auto max-w-[560px] text-center lg:mx-0 lg:text-left">
          <Reveal>
            <p className="font-serif text-2xl italic text-brand-script sm:text-3xl">
              Benvenuto!
            </p>
            <h1 className="mt-4 font-serif text-[clamp(2.85rem,14vw,6rem)] leading-[0.98] tracking-normal text-foreground sm:mt-5 sm:text-[clamp(4.2rem,8vw,6rem)] lg:text-[clamp(4.2rem,6.2vw,6rem)]">
              <span className="whitespace-nowrap">Good Food,</span>
              <span className="block text-primary">Good Mood.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-muted-foreground sm:mt-7 sm:text-base lg:mx-0">
              Authentic Italian flavors made with the freshest ingredients. A
              dining experience that feels like home.
            </p>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start">
              <Button className="h-12 w-full rounded-sm px-8 text-xs font-semibold uppercase tracking-[0.08em] shadow-[var(--shadow-primary-button)] sm:w-auto">
                View Our Menu
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="h-12 w-full rounded-sm border-border bg-transparent px-7 text-xs font-semibold uppercase tracking-[0.08em] text-foreground hover:bg-muted sm:w-auto"
              >
                <CirclePlay className="size-5 text-secondary" />
                Our Story
              </Button>
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
                Made With Love
              </div>
            </div>
          </ParallaxLayer>
          <div className="absolute right-2 top-0 hidden size-28 rounded-full bg-popover/70 shadow-[var(--shadow-hero-orb)] lg:block" />
          <div className="absolute bottom-12 left-36 hidden h-56 w-32 rotate-[-28deg] rounded-sm bg-brand-highlight/55 lg:block" />

          <ParallaxLayer distance={72}>
            <img
              src="/images/friedrice.png"
              alt="A plate of fresh Italian pasta with basil and tomatoes"
              className="relative animate-[spin_245s_linear_infinite] z-10 w-full max-w-[520px] object-contain drop-shadow-[var(--shadow-hero-image)] lg:max-w-[560px]"
            />
          </ParallaxLayer>
        </div>
      </div>
    </section>
  );
}
