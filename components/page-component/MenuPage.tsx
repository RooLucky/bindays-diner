import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const dishes = [
  {
    name: "Spaghetti Pomodoro",
    description: "Classic spaghetti with fresh tomato sauce, garlic, and basil.",
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
    description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone.",
    price: "$9",
    image: "/images/menu-tiramisu.png",
  },
];

export function MenuPage() {
  return (
    <section className="bg-brand-cream px-6 py-16 lg:px-10 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_2fr]">
        <div className="max-w-md">
          <p className="font-serif text-3xl italic text-[#d8c78f]">- Our Favorites -</p>
          <h2 className="mt-3 font-serif text-5xl leading-tight text-stone-950 md:text-6xl">
            Featured Dishes
          </h2>
          <p className="mt-5 max-w-xs text-base leading-8 text-stone-600">
            A selection of our most loved dishes, crafted to bring you an unforgettable
            taste of Italy.
          </p>
          <Button
            variant="link"
            className="mt-8 h-auto rounded-none p-0 text-sm font-bold uppercase tracking-[0.08em] text-brand-red underline decoration-brand-red/30 underline-offset-8 hover:text-brand-red/80"
          >
            View Full Menu
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {dishes.map((dish) => (
            <article
              key={dish.name}
              className="overflow-hidden rounded-sm border border-stone-200/70 bg-brand-linen shadow-[0_10px_32px_rgba(83,62,35,0.07)]"
            >
              <div className="relative aspect-[2.05/1] overflow-hidden">
                <Image
                  src={dish.image}
                  alt={dish.name}
                  fill
                  sizes="(min-width: 1024px) 28vw, (min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
                <span className="absolute bottom-[-1.2rem] right-4 grid size-16 place-items-center rounded-full bg-[#f3d76e] text-lg font-semibold text-stone-800 shadow-[0_10px_18px_rgba(120,92,30,0.16)]">
                  {dish.price}
                </span>
              </div>
              <div className="px-5 pb-7 pt-5">
                <h3 className="font-serif text-2xl leading-tight text-stone-800">
                  {dish.name}
                </h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{dish.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
