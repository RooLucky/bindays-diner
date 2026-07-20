import { menuDishes, type Dish } from "@/lib/menu-campaigns";
import { isAblyRealtimeEnabled } from "@/lib/realtime";

import { MenuCard } from "./MenuCard";
import { Reveal, StaggerContainer, StaggerItem } from "./MotionEffects";
import { PublicMenuRealtimeRefresh } from "./PublicMenuRealtimeRefresh";

export function MenuPage({ dishes = menuDishes }: { dishes?: Dish[] }) {
  const realtimeEnabled = isAblyRealtimeEnabled();

  return (
    <section id="favorites" className="bg-background py-16 lg:py-24">
      {realtimeEnabled ? (
        <PublicMenuRealtimeRefresh categories={["main-dish"]} />
      ) : null}
      <div className="mx-auto max-w-[98dvw] px-4 md:max-w-[95dvw] xl:max-w-[85dvw] xl:px-0">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div>
            <p className="font-serif text-2xl italic text-brand-olive sm:text-3xl">
              - Paboritong Pinoy -
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl">
              Mga Paborito sa Hapag
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
              Familiar Filipino flavors, generous servings, and comforting
              dishes made for everyday cravings and salu-salo moments.
            </p>
            <span className="mx-auto mt-6 block h-px w-24 bg-secondary/45" />
          </div>
        </Reveal>

        <StaggerContainer className="mt-12 grid gap-7 md:grid-cols-3 xl:mt-14 xl:grid-cols-4">
          {dishes.map((dish) => (
            <StaggerItem key={dish.name} className="h-full">
              <MenuCard dish={dish} source="menu" />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
