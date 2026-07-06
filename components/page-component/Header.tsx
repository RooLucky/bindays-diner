import { Leaf } from "lucide-react";

import { Button } from "@/components/ui/button";

const navItems = ["Home", "Menu", "About", "Story", "Reservations", "Gallery", "Contact"];

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-6 lg:px-12">
      <a href="/home" className="flex items-center gap-3" aria-label="Bindays Diner home">
        <span className="flex size-10 items-center justify-center text-brand-olive">
          <Leaf className="size-7" strokeWidth={1.5} />
        </span>
        <span className="leading-none">
          <span className="block font-serif text-3xl text-brand-red">Bindays Diner</span>
          <span className="block pt-1 text-[0.65rem] font-semibold uppercase tracking-[0.38em] text-stone-500">
            Italian Kitchen
          </span>
        </span>
      </a>

      <nav className="hidden items-center gap-9 text-xs font-semibold uppercase tracking-[0.08em] text-stone-800 lg:flex">
        {navItems.map((item) => (
          <a
            key={item}
            href="#"
            className="relative py-2 transition-colors hover:text-brand-red first:text-brand-red first:after:absolute first:after:inset-x-0 first:after:bottom-0 first:after:h-px first:after:bg-brand-red"
          >
            {item}
          </a>
        ))}
      </nav>

      <Button className="hidden h-11 rounded-sm bg-brand-red px-8 text-xs uppercase tracking-[0.08em] shadow-[0_10px_24px_rgba(197,26,20,0.25)] hover:bg-brand-red/90 md:inline-flex">
        Book a Table
      </Button>
    </header>
  );
}
