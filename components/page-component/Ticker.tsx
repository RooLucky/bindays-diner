import { ChefHat, Heart, Leaf, MapPin } from "lucide-react";

const tickerItems = [
  {
    icon: Leaf,
    title: "Fresh Ingredients",
    description: "We source only the freshest and highest quality ingredients.",
  },
  {
    icon: ChefHat,
    title: "Expert Chefs",
    description: "Our chefs bring years of experience to every dish.",
  },
  {
    icon: Heart,
    title: "Made With Love",
    description: "Every dish is made with passion and dedication.",
  },
  {
    icon: MapPin,
    title: "Cozy Ambience",
    description: "A warm and welcoming place for family and friends.",
  },
];

export function Ticker() {
  return (
    <section className="bg-brand-cream px-6 pb-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 border-y border-stone-200/80 bg-brand-cream md:grid-cols-2 xl:grid-cols-4">
        {tickerItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-center gap-5 px-4 py-7 xl:px-8"
            >
              <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#f7ead6] text-[#c29a2e] shadow-[0_10px_28px_rgba(118,86,32,0.08)]">
                <Icon className="size-8" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-stone-900">
                  {item.title}
                </h2>
                <p className="mt-2 max-w-[15rem] text-sm leading-6 text-stone-600">
                  {item.description}
                </p>
              </div>
              {index < tickerItems.length - 1 ? (
                <span className="ml-auto hidden h-20 w-px bg-stone-200 xl:block" />
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
