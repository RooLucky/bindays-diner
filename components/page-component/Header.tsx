import { Leaf } from "lucide-react";

import { Button } from "@/components/ui/button";

const navItems = ["Home", "Menu", "About", "Story", "Reservations", "Gallery", "Contact"];

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-[98dvw] items-center justify-between px-4 py-5 sm:py-6 md:max-w-[95dvw] xl:max-w-[85dvw] xl:px-0">
      <a href="/home" className="flex items-center gap-3" aria-label="Bindays Diner home">
        <span className="flex size-9 items-center justify-center text-secondary sm:size-10">
          <Leaf className="size-6 sm:size-7" strokeWidth={1.5} />
        </span>
        <span className="leading-none">
          <span className="block font-serif text-2xl text-primary sm:text-3xl">
            Bindays Diner
          </span>
          <span className="block pt-1 text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground sm:text-[0.65rem] sm:tracking-[0.38em]">
            Italian Kitchen
          </span>
        </span>
      </a>

      <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.08em] text-foreground xl:flex 2xl:gap-9">
        {navItems.map((item) => (
          <a
            key={item}
            href="#"
            className="relative py-2 transition-colors hover:text-primary first:text-primary first:after:absolute first:after:inset-x-0 first:after:bottom-0 first:after:h-px first:after:bg-primary"
          >
            {item}
          </a>
        ))}
      </nav>

      <Button className="hidden h-11 rounded-sm px-6 text-xs uppercase tracking-[0.08em] shadow-[var(--shadow-header-button)] md:inline-flex lg:px-8">
        Book a Table
      </Button>
    </header>
  );
}
