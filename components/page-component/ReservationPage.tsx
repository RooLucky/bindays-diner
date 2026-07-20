"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Mail, MapPin, Phone, ShoppingCart, Users } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

import { useCart } from "./CartProvider";
import { Reveal, StaggerContainer, StaggerItem } from "./MotionEffects";

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
  const {
    fulfillmentMode,
    getSummary,
    items,
    setFulfillmentMode,
    subtotal,
    totalQuantity,
  } = useCart();
  const cartSummary = useMemo(() => getSummary(), [getSummary]);
  const [notes, setNotes] = useState("");
  const [notesEdited, setNotesEdited] = useState(false);
  const [reservationDate, setReservationDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    return date;
  }, []);

  useEffect(() => {
    if (!notesEdited) {
      setNotes(cartSummary);
    }
  }, [cartSummary, notesEdited]);

  if (items.length === 0) {
    return (
      <section className="bg-background px-4 py-16 sm:py-24">
        <div className="mx-auto flex min-h-[55dvh] max-w-2xl flex-col items-center justify-center rounded-sm border border-border bg-card px-6 py-12 text-center shadow-[var(--shadow-card)]">
          <span className="grid size-16 place-items-center rounded-full bg-brand-gold-soft text-secondary">
            <ShoppingCart className="size-7" />
          </span>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.08em] text-primary">
            Food selection required
          </p>
          <h1 className="mt-3 font-serif text-4xl text-foreground sm:text-5xl">
            Add meals before reserving
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
            Dine-in and delivery requests begin with a food order. Choose your
            meals first, then continue from your order.
          </p>
          <Link
            href="/menu"
            className={cn(
              buttonVariants(),
              "mt-7 h-12 rounded-sm px-7 text-xs font-semibold uppercase tracking-[0.08em]",
            )}
          >
            Browse the Menu
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-background py-8 sm:py-10 lg:py-16">
      <div className="mx-auto grid max-w-[98dvw] gap-8 px-3 sm:px-4 md:max-w-[95dvw] md:gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start xl:max-w-[85dvw] xl:px-0">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-xl lg:text-left">
          <Reveal>
            <p className="font-serif text-xl italic text-brand-script sm:text-2xl md:text-3xl">
              {fulfillmentMode === "delivery"
                ? "Deliver To Your Home"
                : "Dine In With Your Order"}
            </p>
            <h1 className="mt-3 font-serif text-[clamp(2.55rem,12vw,4rem)] leading-[0.98] text-foreground md:text-[clamp(3.6rem,8vw,5rem)] lg:text-[clamp(4rem,5.6vw,5.6rem)]">
              {fulfillmentMode === "delivery"
                ? "Get Your Favorites Delivered Fresh"
                : "Reserve Your Meals and Table"}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8 lg:mx-0 lg:max-w-md">
              {fulfillmentMode === "delivery"
                ? "Send your delivery details and selected meals so our team can confirm your order and schedule."
                : "Confirm your selected meals, visit schedule, and party size so our team can prepare your food and table together."}
            </p>
          </Reveal>

          <StaggerContainer className="mt-7 grid gap-3 sm:grid-cols-3 lg:mt-10 lg:grid-cols-1 lg:gap-5">
            <StaggerItem>
            <p className="flex items-start gap-3 rounded-sm border border-border bg-card/60 p-4 text-left text-sm leading-6 text-muted-foreground transition-transform duration-500 hover:-translate-y-1 lg:border-transparent lg:bg-transparent lg:p-0">
              <Phone className="mt-1 size-4 shrink-0 text-primary" />
              <span>
                <strong className="block text-foreground">Phone</strong>
                +1 (555) 123-4567
              </span>
            </p>
            </StaggerItem>
            <StaggerItem>
            <p className="flex items-start gap-3 rounded-sm border border-border bg-card/60 p-4 text-left text-sm leading-6 text-muted-foreground transition-transform duration-500 hover:-translate-y-1 lg:border-transparent lg:bg-transparent lg:p-0">
              <Mail className="mt-1 size-4 shrink-0 text-primary" />
              <span>
                <strong className="block text-foreground">Email</strong>
                info@bindaysdiner.com
              </span>
            </p>
            </StaggerItem>
            <StaggerItem>
            <p className="flex items-start gap-3 rounded-sm border border-border bg-card/60 p-4 text-left text-sm leading-6 text-muted-foreground transition-transform duration-500 hover:-translate-y-1 lg:border-transparent lg:bg-transparent lg:p-0">
              <MapPin className="mt-1 size-4 shrink-0 text-primary" />
              <span>
                <strong className="block text-foreground">Address</strong>
                123 Italian Street, Food City
              </span>
            </p>
            </StaggerItem>
          </StaggerContainer>
        </div>

        <Reveal className="mx-auto w-full max-w-2xl lg:max-w-none" y={34}>
        <form className="rounded-sm border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5 md:p-6 xl:p-8">
          <h2 className="font-serif text-2xl text-foreground sm:text-3xl">
            {fulfillmentMode === "delivery"
              ? "Delivery Details"
              : "Dine-In Meal Reservation"}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-1 rounded-sm border border-border bg-background p-1 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                setFulfillmentMode("dine-in");
                setNotesEdited(false);
              }}
              className={cn(
                "min-h-10 rounded-sm px-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] transition-colors sm:text-xs",
                fulfillmentMode === "dine-in"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              Dine In
            </button>
            <button
              type="button"
              onClick={() => {
                setFulfillmentMode("delivery");
                setNotesEdited(false);
              }}
              className={cn(
                "min-h-10 rounded-sm px-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] transition-colors sm:text-xs",
                fulfillmentMode === "delivery"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              Delivery
            </button>
          </div>
          <div className="mt-5 grid gap-4 sm:mt-6">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Full Name
              <input
                className="h-11 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                placeholder="Enter your full name"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Phone
              <input
                className="h-11 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                placeholder="Enter your phone number"
              />
            </label>
            {fulfillmentMode === "delivery" ? (
              <>
                <label className="grid gap-2 text-sm font-medium text-foreground">
                  Delivery Address
                  <input
                    className="h-11 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                    placeholder="House number, street, barangay, city"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-foreground">
                  Landmark or Delivery Notes
                  <input
                    className="h-11 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                    placeholder="Nearby landmark, gate color, or rider instructions"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-foreground">
                    Delivery Date
                    <DatePicker
                      value={deliveryDate}
                      onChange={setDeliveryDate}
                      placeholder="Select delivery date"
                      disabledDates={{ before: today }}
                      startMonth={today}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-foreground">
                    Preferred Time
                    <input
                      type="time"
                      className="h-11 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                    />
                  </label>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-foreground">
                    Date
                    <DatePicker
                      value={reservationDate}
                      onChange={setReservationDate}
                      placeholder="Select reservation date"
                      disabledDates={{ before: today }}
                      startMonth={today}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-foreground">
                    Time
                    <input
                      type="time"
                      className="h-11 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                    />
                  </label>
                </div>
                <label className="grid gap-2 text-sm font-medium text-foreground">
                  Number of Persons
                  <input
                    type="number"
                    min="1"
                    className="h-11 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                    placeholder="How many guests?"
                  />
                </label>
              </>
            )}
            <label className="grid gap-2 text-sm font-medium text-foreground">
              {fulfillmentMode === "delivery"
                ? "Food or Delivery Notes"
                : "Food or Table Notes"}
              {items.length > 0 ? (
                <div className="rounded-sm border border-border bg-background p-3 sm:p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
                    Selected meals
                  </p>
                  <div className="mt-3 space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-[1fr_auto] items-start gap-3 text-sm"
                      >
                        <span className="min-w-0 text-muted-foreground">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="shrink-0 font-semibold text-foreground">
                          {item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      {totalQuantity} item{totalQuantity === 1 ? "" : "s"}
                    </span>
                    <span className="font-serif text-2xl text-foreground">
                      P{subtotal.toLocaleString("en-PH")}
                    </span>
                  </div>
                </div>
              ) : null}
              <textarea
                value={notes}
                onChange={(event) => {
                  setNotes(event.target.value);
                  setNotesEdited(true);
                }}
                className="min-h-32 w-full rounded-sm border border-input bg-background px-3 py-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                placeholder={
                  fulfillmentMode === "delivery"
                    ? "Any food request, delivery timing note, or special instruction?"
                    : "Any food reservation, table preference, or special occasion?"
                }
              />
            </label>
          </div>
          <Button className="mt-6 min-h-12 w-full whitespace-normal rounded-sm px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em]">
            {fulfillmentMode === "delivery"
              ? "Send Delivery Request"
              : "Send Dine-In Request"}
          </Button>
        </form>
        </Reveal>
      </div>

      <StaggerContainer className="mx-auto mt-10 grid max-w-[98dvw] grid-cols-1 border-y border-border px-3 sm:px-4 md:max-w-[95dvw] md:grid-cols-3 xl:max-w-[85dvw] xl:px-0">
        {bookingBenefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <StaggerItem key={benefit.title}>
            <div
              className="flex flex-col items-center gap-4 py-6 text-center md:px-5 xl:flex-row xl:text-left"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-gold-soft text-secondary">
                <Icon className="size-6" />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-foreground">
                  {benefit.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </section>
  );
}
