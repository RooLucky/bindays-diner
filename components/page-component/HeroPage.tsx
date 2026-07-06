import Image from "next/image";
import { ArrowRight, CirclePlay } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HeroPage() {
  return (
    <section className="overflow-hidden bg-brand-cream text-foreground">
      <div className="mx-auto grid min-h-[560px] w-full max-w-[1440px] items-center gap-8 px-6 pb-12 pt-8 lg:grid-cols-[0.84fr_1.16fr] lg:px-12 lg:pb-8 lg:pt-10 xl:min-h-[590px]">
        <div className="relative z-10 max-w-[560px] text-center sm:text-left">
          <p className="font-serif text-3xl italic text-stone-400">Benvenuto!</p>
          <h1 className="mt-5 font-serif text-[clamp(4.2rem,6.2vw,6rem)] leading-[0.98] tracking-normal text-stone-950">
            <span className="whitespace-nowrap">Good Food,</span>
            <span className="block text-brand-red">Good Mood.</span>
          </h1>
          <p className="mt-7 max-w-md text-base leading-7 text-stone-600">
            Authentic Italian flavors made with the freshest ingredients. A dining
            experience that feels like home.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
            <Button className="h-12 w-full rounded-sm bg-brand-red px-8 text-xs font-semibold uppercase tracking-[0.08em] shadow-[0_14px_28px_rgba(197,26,20,0.24)] hover:bg-brand-red/90 sm:w-auto">
              View Our Menu
              <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="h-12 w-full rounded-sm border-stone-300 bg-transparent px-7 text-xs font-semibold uppercase tracking-[0.08em] text-stone-700 hover:bg-brand-linen sm:w-auto"
            >
              <CirclePlay className="size-5 text-brand-olive" />
              Our Story
            </Button>
          </div>
        </div>

        <div className="relative mx-auto flex w-full items-center justify-end lg:min-h-[520px]">
          <div className="absolute left-4 top-4 hidden size-32 rounded-full border border-brand-red/35 text-brand-red md:grid md:place-items-center">
            <div className="grid size-24 place-items-center rounded-full border border-brand-red/25 text-center text-[0.58rem] font-semibold uppercase tracking-[0.22em]">
              Made With Love
            </div>
          </div>
          <div className="absolute right-2 top-0 hidden size-28 rounded-full bg-white/70 shadow-[18px_22px_36px_rgba(91,68,34,0.14)] lg:block" />
          <div className="absolute bottom-12 left-36 hidden h-56 w-32 rotate-[-28deg] rounded-sm bg-[#dfb649]/55 lg:block" />

          <Image
            src="/images/hero-pasta.png"
            alt="A plate of fresh Italian pasta with basil and tomatoes"
            width={876}
            height={487}
            priority
            className="relative z-10 w-full max-w-[820px] object-contain drop-shadow-[0_22px_45px_rgba(61,45,24,0.16)]"
          />
        </div>
      </div>
    </section>
  );
}
