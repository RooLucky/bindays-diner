"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { CalendarDays, Mail, MapPin, Phone, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

import { useCart } from "./CartProvider";
import { Reveal, StaggerContainer, StaggerItem } from "./MotionEffects";

const deliveryBenefits = [
  {
    icon: CalendarDays,
    title: "Scheduled Delivery",
    description: "Choose your preferred delivery date and time.",
  },
  {
    icon: MapPin,
    title: "Clear Delivery Details",
    description: "Share your address, landmark, and rider instructions.",
  },
  {
    icon: Phone,
    title: "Secure Payment Link",
    description: "Your request stays pending until payment is confirmed from the emailed link.",
  },
];

function defaultDeliverySchedule() {
  const date = new Date(Date.now() + 45 * 60 * 1_000);
  const dateValue = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
  const timeValue = [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
  ].join(":");

  return { dateValue, timeValue };
}

export function ReservationPage() {
  const { clearCart, getSummary, items, subtotal, totalQuantity } = useCart();
  const cartSummary = useMemo(() => getSummary(), [getSummary]);
  const [notes, setNotes] = useState("");
  const [notesEdited, setNotesEdited] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
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

  useEffect(() => {
    const schedule = defaultDeliverySchedule();
    setDeliveryDate(schedule.dateValue);
    setDeliveryTime(schedule.timeValue);
  }, []);

  const inputClassName = (field: string) =>
    cn(
      "h-11 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
      fieldErrors[field] &&
        "border-destructive ring-1 ring-destructive/30 focus-visible:ring-destructive/30",
    );

  const clearFieldError = (field: string) => {
    setFieldErrors((errors) => {
      if (!errors[field]) {
        return errors;
      }

      const nextErrors = { ...errors };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const deliveryAddress = String(formData.get("deliveryAddress") ?? "").trim();
    const selectedDeliveryTime = String(formData.get("deliveryTime") ?? "").trim();
    const errors: Record<string, string> = {};

    if (fullName.length < 2) errors.fullName = "Enter your full name.";
    if (phone.length < 7) errors.phone = "Enter a valid phone number.";
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = "Enter a valid contact email.";
    }
    if (deliveryAddress.length < 8) {
      errors.deliveryAddress = "Enter your house number, street, barangay, and city.";
    }
    if (!deliveryDate) errors.deliveryDate = "Choose a delivery date.";
    if (!selectedDeliveryTime) errors.deliveryTime = "Choose a preferred time.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please complete all required delivery details correctly.");
      return;
    }

    setFieldErrors({});

    startTransition(async () => {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          deliveryAddress: formData.get("deliveryAddress"),
          landmark: formData.get("landmark"),
          deliveryDate,
          deliveryTime: formData.get("deliveryTime"),
          notes,
          items: items.map(({ name, price, quantity }) => ({
            name,
            price,
            quantity,
          })),
          subtotal,
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        toast.error(data.error ?? "Unable to send your delivery request.");
        return;
      }

      clearCart();
      form.reset();
      setDeliveryDate("");
      setDeliveryTime("");
      setNotes("");
      setNotesEdited(false);
      toast.success("Reservation request sent. Check your email for the payment link.");
    });
  }

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
            Add meals before delivery
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
            Delivery requests begin with a food order. Choose your meals first,
            then continue from your order.
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
              Deliver To Your Home
            </p>
            <h1 className="mt-3 font-serif text-[clamp(2.55rem,12vw,4rem)] leading-[0.98] text-foreground md:text-[clamp(3.6rem,8vw,5rem)] lg:text-[clamp(4rem,5.6vw,5.6rem)]">
              Get Your Favorites Delivered Fresh
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8 lg:mx-0 lg:max-w-md">
              Send your delivery details and selected meals so our team can
              confirm your order and schedule.
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
                Legazpi City, Albay
              </span>
            </p>
            </StaggerItem>
          </StaggerContainer>
        </div>

        <Reveal className="mx-auto w-full max-w-2xl lg:max-w-none" y={34}>
        <form noValidate onSubmit={handleSubmit} className="rounded-sm border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5 md:p-6 xl:p-8">
          <h2 className="font-serif text-2xl text-foreground sm:text-3xl">
            Delivery Details
          </h2>
          <div className="mt-5 grid gap-4 sm:mt-6">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Full Name
              <input
                name="fullName"
                required
                aria-invalid={Boolean(fieldErrors.fullName)}
                onChange={() => clearFieldError("fullName")}
                className={inputClassName("fullName")}
                placeholder="Enter your full name"
              />
              {fieldErrors.fullName ? <span className="text-xs font-normal text-destructive">{fieldErrors.fullName}</span> : null}
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Phone
              <input
                name="phone"
                required
                aria-invalid={Boolean(fieldErrors.phone)}
                onChange={() => clearFieldError("phone")}
                className={inputClassName("phone")}
                placeholder="Enter your phone number"
              />
              {fieldErrors.phone ? <span className="text-xs font-normal text-destructive">{fieldErrors.phone}</span> : null}
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Contact Email
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
                onChange={() => clearFieldError("email")}
                className={inputClassName("email")}
                placeholder="you@example.com"
              />
              {fieldErrors.email ? <span className="text-xs font-normal text-destructive">{fieldErrors.email}</span> : null}
              <span className="text-xs font-normal text-muted-foreground">We&apos;ll email your 30-minute payment link here.</span>
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Delivery Address
              <input
                name="deliveryAddress"
                required
                aria-invalid={Boolean(fieldErrors.deliveryAddress)}
                onChange={() => clearFieldError("deliveryAddress")}
                className={inputClassName("deliveryAddress")}
                placeholder="House number, street, barangay, city"
              />
              {fieldErrors.deliveryAddress ? <span className="text-xs font-normal text-destructive">{fieldErrors.deliveryAddress}</span> : null}
            </label>
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Landmark or Delivery Notes
              <input
                name="landmark"
                className="h-11 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                placeholder="Nearby landmark, gate color, or rider instructions"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Delivery Date
                <DatePicker
                  value={deliveryDate}
                  onChange={(value) => {
                    setDeliveryDate(value);
                    clearFieldError("deliveryDate");
                  }}
                  placeholder="Select delivery date"
                  disabledDates={{ before: today }}
                  startMonth={today}
                  className={fieldErrors.deliveryDate ? "border-destructive ring-1 ring-destructive/30" : undefined}
                />
                {fieldErrors.deliveryDate ? <span className="text-xs font-normal text-destructive">{fieldErrors.deliveryDate}</span> : null}
              </label>
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Preferred Time
                <input
                  name="deliveryTime"
                  type="time"
                  required
                  value={deliveryTime}
                  aria-invalid={Boolean(fieldErrors.deliveryTime)}
                  onChange={(event) => {
                    setDeliveryTime(event.target.value);
                    clearFieldError("deliveryTime");
                  }}
                  className={inputClassName("deliveryTime")}
                />
                {fieldErrors.deliveryTime ? <span className="text-xs font-normal text-destructive">{fieldErrors.deliveryTime}</span> : null}
              </label>
            </div>
            <label className="grid gap-2 text-sm font-medium text-foreground">
              Food or Delivery Notes
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
                name="notes"
                value={notes}
                onChange={(event) => {
                  setNotes(event.target.value);
                  setNotesEdited(true);
                }}
                className="min-h-32 w-full rounded-sm border border-input bg-background px-3 py-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                placeholder="Any food request, delivery timing note, or special instruction?"
              />
            </label>
          </div>
          <Button type="submit" disabled={isPending} className="mt-6 min-h-12 w-full whitespace-normal rounded-sm px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em]">
            {isPending ? "Sending request..." : "Send Delivery Request"}
          </Button>
        </form>
        </Reveal>
      </div>

      <StaggerContainer className="mx-auto mt-10 grid max-w-[98dvw] grid-cols-1 border-y border-border px-3 sm:px-4 md:max-w-[95dvw] md:grid-cols-3 xl:max-w-[85dvw] xl:px-0">
        {deliveryBenefits.map((benefit) => {
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
