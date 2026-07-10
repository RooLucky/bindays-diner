import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { menuDishes, type Dish } from "@/lib/menu-campaigns";
import { cn } from "@/lib/utils";

import { MenuCard } from "./MenuCard";
import { Reveal, StaggerContainer, StaggerItem } from "./MotionEffects";

export function MenuPage({ dishes = menuDishes }: { dishes?: Dish[] }) {
  return (
    <section className="bg-background py-16 lg:py-20">
      <div className="mx-auto grid max-w-[98dvw] gap-10 px-4 md:max-w-[95dvw] xl:max-w-[85dvw] xl:grid-cols-[0.82fr_2fr] xl:px-0">
        <Reveal className="mx-auto max-w-md text-center xl:mx-0 xl:text-left">
          <div>
            <p className="font-serif text-2xl italic text-brand-olive sm:text-3xl">
              - Our Favorites -
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl">
              Featured Dishes
            </h2>
            <p className="mx-auto mt-5 max-w-xs text-base leading-8 text-muted-foreground xl:mx-0">
              A selection of our most loved dishes, crafted to bring you an
              unforgettable taste of Italy.
            </p>
            <Link
              href="/reservations"
              className={cn(
                buttonVariants({ variant: "link" }),
                "mt-8 h-auto rounded-none p-0 text-sm font-bold uppercase tracking-[0.08em] text-primary underline decoration-primary/30 underline-offset-8 hover:text-primary/80",
              )}
            >
              Reserve Favorites
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>

        <StaggerContainer className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {dishes.map((dish) => (
            <StaggerItem key={dish.name}>
              <MenuCard dish={dish} source="menu" />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
