import Image from "next/image";

import type { Dish } from "@/lib/menu-campaigns";

export function MenuCard({ dish }: { dish: Dish }) {
  return (
    <article className="overflow-hidden rounded-sm border border-border bg-card shadow-[var(--shadow-card)]">
      <div className="relative aspect-[2.05/1] overflow-hidden">
        <Image
          src={dish.image}
          alt={dish.name}
          fill
          sizes="(min-width: 1280px) 24vw, (min-width: 768px) 45vw, 96vw"
          className="object-cover"
        />
        {dish.tag ? (
          <span className="absolute left-3 top-3 rounded-full bg-popover/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-secondary shadow-[var(--shadow-soft-icon)]">
            {dish.tag}
          </span>
        ) : null}
        <span className="absolute bottom-[-1.2rem] right-4 grid size-16 place-items-center rounded-full bg-brand-price text-lg font-semibold text-foreground shadow-[var(--shadow-price)]">
          {dish.price}
        </span>
      </div>
      <div className="px-5 pb-7 pt-6">
        <h3 className="font-serif text-2xl leading-tight text-foreground">
          {dish.name}
        </h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {dish.description}
        </p>
      </div>
    </article>
  );
}

