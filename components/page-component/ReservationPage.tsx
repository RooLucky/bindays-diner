import { CalendarDays, Mail, MapPin, Phone, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

const bookingBenefits = [
  {
    icon: CalendarDays,
    title: "Easy Booking",
    description: "Pick a preferred date and time for your visit.",
  },
  {
    icon: Users,
    title: "Table Planning",
    description: "Tell us how many guests we should prepare for.",
  },
  {
    icon: Phone,
    title: "Staff Follow-up",
    description: "Reservations stay pending until the team confirms.",
  },
];

export function ReservationPage() {
  return (
    <section className="bg-background py-12 lg:py-20">
      <div className="mx-auto grid max-w-[98dvw] gap-10 px-4 md:max-w-[95dvw] lg:grid-cols-[0.85fr_1.15fr] xl:max-w-[85dvw] xl:px-0">
        <div className="max-w-xl">
          <p className="font-serif text-2xl italic text-brand-script sm:text-3xl">
            Reserve Your Table
          </p>
          <h1 className="mt-4 font-serif text-[clamp(3rem,10vw,5.6rem)] leading-[0.98] text-foreground">
            Book a Table for a Great Dining Experience
          </h1>
          <p className="mt-6 max-w-md text-base leading-8 text-muted-foreground">
            Whether it is a family gathering, student celebration, or food pickup
            request, send your preferred details and our team can confirm availability.
          </p>

          <div className="mt-10 space-y-5">
            <p className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
              <Phone className="mt-1 size-4 text-primary" />
              <span>
                <strong className="block text-foreground">Phone</strong>
                +1 (555) 123-4567
              </span>
            </p>
            <p className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
              <Mail className="mt-1 size-4 text-primary" />
              <span>
                <strong className="block text-foreground">Email</strong>
                info@bindaysdiner.com
              </span>
            </p>
            <p className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
              <MapPin className="mt-1 size-4 text-primary" />
              <span>
                <strong className="block text-foreground">Address</strong>
                123 Italian Street, Food City
              </span>
            </p>
          </div>
        </div>

        <form className="rounded-sm border border-border bg-card p-6 shadow-[var(--shadow-card)] md:p-8">
          <h2 className="font-serif text-3xl text-foreground">Make a Reservation</h2>
          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Full Name
              <input
                className="h-11 rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                placeholder="Enter your full name"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Phone
              <input
                className="h-11 rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                placeholder="Enter your phone number"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Date
                <input
                  type="date"
                  className="h-11 rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Time
                <input
                  type="time"
                  className="h-11 rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Number of Persons
              <input
                type="number"
                min="1"
                className="h-11 rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                placeholder="How many guests?"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Food or Table Notes
              <textarea
                className="min-h-32 rounded-sm border border-input bg-background px-3 py-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                placeholder="Any food reservation, table preference, or special occasion?"
              />
            </label>
          </div>
          <Button className="mt-6 h-12 w-full rounded-sm text-xs font-semibold uppercase tracking-[0.08em]">
            Send Request
          </Button>
        </form>
      </div>

      <div className="mx-auto mt-12 grid max-w-[98dvw] grid-cols-1 border-y border-border px-4 md:max-w-[95dvw] md:grid-cols-3 xl:max-w-[85dvw] xl:px-0">
        {bookingBenefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <div key={benefit.title} className="flex gap-4 py-6 md:px-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-gold-soft text-secondary">
                <Icon className="size-6" />
              </span>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-foreground">
                  {benefit.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

