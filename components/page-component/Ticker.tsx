import { ChefHat, Heart, Leaf, MapPin } from "lucide-react";

import { StaggerContainer, StaggerItem } from "./MotionEffects";

const tickerItems = [
  {
    icon: Leaf,
    title: "Fresh Every Day",
    description: "Fresh ingredients prepared daily for every satisfying meal.",
  },
  {
    icon: ChefHat,
    title: "Lutong Bahay",
    description: "Familiar Filipino flavors cooked with the care of home.",
  },
  {
    icon: Heart,
    title: "Made for Sharing",
    description: "Generous dishes for family meals, barkada, and celebrations.",
  },
  {
    icon: MapPin,
    title: "Warm Welcome",
    description: "Relaxed Filipino hospitality in the heart of Legazpi City.",
  },
];

export function Ticker() {
  return (
    <section className="bg-background pb-8">
      <StaggerContainer className="mx-auto grid max-w-[98dvw] grid-cols-1 border-y border-border bg-background px-4 md:max-w-[95dvw] md:grid-cols-2 xl:max-w-[85dvw] xl:grid-cols-4 xl:px-0">
        {tickerItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <StaggerItem key={item.title}>
              <div className="flex flex-col items-center gap-4 px-0 py-6 text-center sm:gap-5 sm:px-4 sm:py-7 xl:flex-row xl:items-center xl:text-left xl:px-8">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-gold-soft text-brand-olive shadow-[var(--shadow-soft-icon)] transition-transform duration-500 hover:scale-110 sm:size-16">
                  <Icon className="size-7 sm:size-8" strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-foreground">
                    {item.title}
                  </h2>
                  <p className="mx-auto mt-2 max-w-[15rem] text-sm leading-6 text-muted-foreground xl:mx-0">
                    {item.description}
                  </p>
                </div>
                {index < tickerItems.length - 1 ? (
                  <span className="ml-auto hidden h-20 w-px bg-border xl:block" />
                ) : null}
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </section>
  );
}
