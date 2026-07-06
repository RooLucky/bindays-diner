import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const dishes = [
  {
    name: "Spaghetti Pomodoro",
    description:
      "Classic spaghetti with fresh tomato sauce, garlic, and basil.",
    price: "$18",
    image: "/images/menu-spaghetti.png",
  },
  {
    name: "Margherita Pizza",
    description: "Fresh tomatoes, mozzarella, basil, and our homemade sauce.",
    price: "$20",
    image: "/images/menu-pizza.png",
  },
  {
    name: "Tiramisu",
    description:
      "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone.",
    price: "$9",
    image: "/images/menu-tiramisu.png",
  },
];

export function MenuPage() {
  return (
    <section className="bg-background py-16 lg:py-20">
      <div className="mx-auto grid max-w-[98dvw] gap-10 px-4 md:max-w-[95dvw] xl:max-w-[85dvw] xl:grid-cols-[0.82fr_2fr] xl:px-0">
        <div className="max-w-md text-center sm:text-left">
          <p className="font-serif text-2xl italic text-brand-olive sm:text-3xl">
            - Our Favorites -
          </p>
          <h2 className="mt-3 font-serif text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl">
            Featured Dishes
          </h2>
          <p className="mx-auto mt-5 max-w-xs text-base leading-8 text-muted-foreground sm:mx-0">
            A selection of our most loved dishes, crafted to bring you an
            unforgettable taste of Italy.
          </p>
          <Button
            variant="link"
            className="mt-8 h-auto rounded-none p-0 text-sm font-bold uppercase tracking-[0.08em] text-primary underline decoration-primary/30 underline-offset-8 hover:text-primary/80"
          >
            View Full Menu
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {dishes.map((dish) => (
            <article
              key={dish.name}
              className="overflow-hidden rounded-sm border border-border bg-card shadow-[var(--shadow-card)]"
            >
              <div className="relative aspect-[2.05/1] overflow-hidden">
                <Image
                  src={dish.image}
                  alt={dish.name}
                  fill
                  sizes="(min-width: 1024px) 28vw, (min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
                <span className="absolute bottom-[-1.2rem] right-4 grid size-16 place-items-center rounded-full bg-brand-price text-lg font-semibold text-foreground shadow-[var(--shadow-price)]">
                  {dish.price}
                </span>
              </div>
              <div className="px-5 pb-7 pt-5">
                <h3 className="font-serif text-2xl leading-tight text-foreground">
                  {dish.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {dish.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
