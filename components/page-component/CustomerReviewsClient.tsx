"use client";

import { ChangeEvent, FormEvent, useState, useTransition } from "react";
import { ExternalLink, ImagePlus, Send, Star, X } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import type {
  PublicReviewsPayload,
  WebsiteReview,
} from "@/lib/review-contracts";
import { cn } from "@/lib/utils";

type CustomerReviewsClientProps = {
  initialPayload: PublicReviewsPayload;
  initialCaptcha: {
    question: string;
    answer: number;
  };
};

const ratingOptions = [5, 4, 3, 2, 1] as const;
const maxReviewImages = 2;

function createCaptcha() {
  const left = Math.floor(Math.random() * 8) + 2;
  const right = Math.floor(Math.random() * 7) + 1;

  return {
    question: `${left} + ${right}`,
    answer: left + right,
  };
}

export function CustomerReviewsClient({
  initialPayload,
  initialCaptcha,
}: CustomerReviewsClientProps) {
  const [payload, setPayload] = useState(initialPayload);
  const [rating, setRating] = useState(5);
  const [captcha, setCaptcha] = useState(initialCaptcha);
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length > maxReviewImages) {
      toast.error("Upload only up to 2 review images.");
      event.target.value = "";
      setImageNames([]);
      return;
    }

    setImageNames(files.map((file) => file.name));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      formData.set("rating", String(rating));
      formData.set("captchaExpected", String(captcha.answer));

      const response = await fetch("/api/reviews", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        review?: WebsiteReview;
        error?: string;
      };

      if (!response.ok || !data.review) {
        toast.error(data.error ?? "Unable to submit your review.");
        return;
      }

      const createdReview = data.review;

      setPayload((current) => ({
        ...current,
        reviews: current.reviews,
      }));
      form.reset();
      setImageNames([]);
      setRating(5);
      setCaptcha(createCaptcha());
      toast.success(
        `${createdReview.fullName}, your review was submitted for admin approval.`,
      );
    });
  }

  return (
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      className="relative overflow-hidden border-y border-border bg-background py-10 text-foreground sm:py-14 lg:py-24"
    >
      <div className="mx-auto grid w-full max-w-xl gap-8 px-4 sm:max-w-[95dvw] sm:gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 xl:max-w-[85dvw] xl:px-0">
        <div className="min-w-0">
          <p className="font-serif text-2xl italic text-brand-script sm:text-3xl">
            - Guest Reviews -
          </p>
          <h2
            id="reviews-title"
            className="mt-3 max-w-xl font-serif text-[clamp(2.2rem,7.5vw,4.5rem)] leading-[1.02]"
          >
            Loved by neighbors, classmates, and families.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
            See what guests are saying, then share your own Binday&apos;s Diner
            experience here. Guests can also leave a public review on Google
            Maps.
          </p>

          <div className="mt-7 rounded-sm border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:mt-8 sm:p-7">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                  Website Reviews
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <StarRating
                    rating={Number(payload.websiteRating.average ?? 5)}
                  />
                  <span className="font-serif text-4xl text-foreground">
                    {payload.websiteRating.average ?? "Review"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {payload.websiteRating.count > 0
                    ? `Based on ${payload.websiteRating.count.toLocaleString(
                        "en-PH",
                      )} website reviews.`
                    : "Customer reviews submitted here will appear on this page."}
                </p>
              </div>
            </div>

            <a
              href={payload.google.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants(),
                "mt-6 h-11 w-full justify-center rounded-sm px-5 text-xs font-semibold uppercase tracking-[0.08em] sm:w-auto",
              )}
            >
              Review on Google Maps
              <ExternalLink className="size-4" />
            </a>
          </div>

          {payload.google.reviews.length > 0 ? (
            <div className="mt-5 grid gap-3">
              {payload.google.reviews.slice(0, 2).map((review) => (
                <article
                  key={`${review.authorName}-${review.text}`}
                  className="rounded-sm border border-border bg-card/75 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-foreground">
                      {review.authorName}
                    </p>
                    <StarRating rating={review.rating} compact />
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-muted-foreground">
                    {review.text}
                  </p>
                </article>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid min-w-0 gap-6">
          <form
            onSubmit={handleSubmit}
            className="min-w-0 rounded-sm border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-7"
          >
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Review Binday&apos;s
            </p>
            <h3 className="mt-2 font-serif text-[clamp(1.8rem,5.5vw,2.5rem)] text-foreground">
              Share your experience
            </h3>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-foreground">
                Name
                <input
                  name="fullName"
                  required
                  minLength={2}
                  maxLength={160}
                  className="h-11 rounded-sm border border-border bg-background px-3 text-sm font-normal outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                  placeholder="Your name"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-foreground">
                Favorite item
                <input
                  name="favoriteItem"
                  maxLength={120}
                  className="h-11 rounded-sm border border-border bg-background px-3 text-sm font-normal outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                  placeholder="Optional"
                />
              </label>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-foreground">Rating</p>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {ratingOptions.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={cn(
                      "inline-flex h-10 w-full items-center justify-center gap-1 rounded-sm border px-1 text-sm font-semibold transition-colors",
                      rating === value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-muted",
                    )}
                  >
                    {value}
                    <Star className="size-4 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <label className="mt-5 grid gap-2 text-sm font-semibold text-foreground">
              Review
              <textarea
                name="comment"
                required
                minLength={8}
                maxLength={700}
                rows={5}
                className="resize-none rounded-sm border border-border bg-background px-3 py-3 text-sm font-normal leading-6 outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                placeholder="Tell us what you enjoyed."
              />
            </label>

            <label className="mt-5 grid gap-2 text-sm font-semibold text-foreground">
              Food photos{" "}
              <span className="font-normal text-muted-foreground">
                (optional, max 2)
              </span>
              <input
                name="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="rounded-sm border border-border bg-background px-3 py-3 text-sm font-normal"
              />
            </label>

            {imageNames.length > 0 ? (
              <div className="mt-3 grid gap-2">
                {imageNames.map((name) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 rounded-sm border border-border bg-background px-3 py-2 text-xs text-muted-foreground"
                  >
                    <ImagePlus className="size-4 text-primary" />
                    <span className="min-w-0 flex-1 truncate">{name}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <label className="hidden">
              Company
              <input
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
            </label>

            <label className="mt-5 grid gap-2 text-sm font-semibold text-foreground">
              Anti-bot check: What is {captcha.question}?
              <div className="flex gap-2">
                <input
                  name="captchaAnswer"
                  required
                  inputMode="numeric"
                  className="h-11 min-w-0 flex-1 rounded-sm border border-border bg-background px-3 text-sm font-normal outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
                  placeholder="Answer"
                />
                <button
                  type="button"
                  onClick={() => setCaptcha(createCaptcha())}
                  className="inline-flex h-11 items-center justify-center rounded-sm border border-border bg-background px-3 text-sm font-semibold text-foreground hover:bg-muted"
                  aria-label="Refresh anti-bot question"
                >
                  <X className="size-4 rotate-45" />
                </button>
              </div>
            </label>

            <Button
              type="submit"
              disabled={isPending}
              className="mt-5 h-11 w-full rounded-sm text-xs font-semibold uppercase tracking-[0.08em]"
            >
              <Send className="size-4" />
              {isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </form>

          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            {payload.reviews.length > 0 ? (
              payload.reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-sm border border-border bg-card/80 p-5"
                >
                  <StarRating rating={review.rating} compact />
                  <p className="mt-3 line-clamp-4 text-sm leading-7 text-muted-foreground">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                  {review.imageUrls.length > 0 ? (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {review.imageUrls.map((url) => (
                        <img
                          key={url}
                          src={url}
                          alt={`Review photo from ${review.fullName}`}
                          className="aspect-square w-full rounded-sm object-cover"
                        />
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="font-serif text-xl text-foreground">
                      {review.fullName}
                    </p>
                    {review.favoriteItem ? (
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                        {review.favoriteItem}
                      </p>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-sm border border-dashed border-border bg-card/70 p-6 text-center sm:col-span-2">
                <p className="font-serif text-2xl text-foreground">
                  No website reviews yet.
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Be the first to leave a Binday&apos;s Diner review here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StarRating({
  rating,
  compact = false,
}: {
  rating: number;
  compact?: boolean;
}) {
  const roundedRating = Math.round(rating);

  return (
    <span className="inline-flex items-center gap-1 text-primary">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            compact ? "size-4" : "size-5",
            index < roundedRating ? "fill-current" : "fill-transparent",
          )}
        />
      ))}
    </span>
  );
}
