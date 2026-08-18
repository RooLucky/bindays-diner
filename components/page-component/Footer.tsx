import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageSquare, Phone } from "lucide-react";

const footerLinks = [
  { label: "Food Menu", href: "/menu" },
  { label: "Add-ons", href: "/add-ons" },
  { label: "Drinks", href: "/drinks" },
  { label: "Loyalty Card", href: "/loyalty" },
  { label: "Delivery Order", href: "/reservations" },
];

export function Footer() {
  return (
    <footer className="border-t border-brand-white/15 bg-brand-olive text-brand-white">
      <div className="mx-auto grid w-full max-w-[98dvw] gap-10 px-4 py-12 md:max-w-[95dvw] md:grid-cols-[1.15fr_0.85fr_1fr] md:gap-8 md:py-14 xl:max-w-[85dvw] xl:px-0">
        <div className="max-w-md text-center md:text-left">
          <Link
            href="/home"
            className="inline-flex items-center gap-3"
            aria-label="Binday's Diner home"
          >
            <span className="grid size-12 place-items-center rounded-sm bg-brand-white p-1.5">
              <Image
                src="/images/web-logo.png"
                alt="Binday's Diner logo"
                width={1254}
                height={1254}
                className="size-full object-contain"
              />
            </span>
            <span className="leading-none">
              <span className="block font-serif text-2xl text-brand-white">
                Binday&apos;s Diner
              </span>
              <span className="block pt-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-brand-white/70">
                Legazpi City
              </span>
            </span>
          </Link>
          <p className="mt-5 text-sm leading-7 text-brand-white/75">
            Filipino comfort food, refreshing drinks, and local favorites
            prepared for delivery around Legazpi City.
          </p>
          <Link
            href="/review"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-sm border border-brand-white/40 px-5 text-xs font-semibold uppercase tracking-[0.08em] text-brand-white transition hover:bg-brand-white hover:text-brand-olive"
          >
            <MessageSquare className="size-4" aria-hidden="true" />
            Leave a review
          </Link>
        </div>

        <nav aria-label="Footer navigation" className="text-center md:text-left">
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-brand-white">
            Explore
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 md:grid-cols-1">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-brand-white/75 transition-colors hover:text-brand-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="text-center md:text-left">
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-brand-white">
            Contact
          </h2>
          <div className="mt-5 space-y-5">
            <a
              href="tel:+639929450801"
              className="group flex items-start justify-center gap-3 text-sm text-brand-white/75 md:justify-start"
            >
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-brand-white/10 text-brand-white transition-colors group-hover:bg-brand-white group-hover:text-brand-olive">
                <Phone className="size-4" />
              </span>
              <span className="pt-1.5 transition-colors group-hover:text-brand-white">
                +63 992 945 0801
              </span>
            </a>
            <div className="flex items-start justify-center gap-3 text-sm leading-6 text-brand-white/75 md:justify-start">
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-brand-white/10 text-brand-white">
                <MapPin className="size-4" />
              </span>
              <address className="max-w-xs pt-1 not-italic">
                Corner T. Alonzo St. G/F, Rañola Bldg. Oro Site, Legazpi City,
                Philippines
              </address>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-brand-white/15">
        <div className="mx-auto flex w-full max-w-[98dvw] flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs text-brand-white/60 sm:flex-row sm:text-left md:max-w-[95dvw] xl:max-w-[85dvw] xl:px-0">
          <p>&copy; {new Date().getFullYear()} Binday&apos;s Diner.</p>
          <p>Made with care in Legazpi City.</p>
        </div>
      </div>
    </footer>
  );
}
