"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ImageIcon,
  RefreshCcw,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type {
  CustomerReviewStatus,
  WebsiteReview,
} from "@/lib/review-contracts";
import { cn } from "@/lib/utils";

type AdminReviewsResponse = {
  reviews?: WebsiteReview[];
  review?: WebsiteReview;
  error?: string;
};

const statusFilters = ["all", "draft", "approved", "rejected"] as const;

export function AdminReviewsClient() {
  const [reviews, setReviews] = useState<WebsiteReview[]>([]);
  const [filter, setFilter] =
    useState<(typeof statusFilters)[number]>("draft");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  const filteredReviews = useMemo(() => {
    if (filter === "all") {
      return reviews;
    }

    return reviews.filter((review) => review.status === filter);
  }, [filter, reviews]);

  async function loadReviews() {
    setPending(true);
    setMessage("");

    const response = await fetch("/api/admin/reviews", { cache: "no-store" });
    const data = (await response.json()) as AdminReviewsResponse;

    setPending(false);

    if (!response.ok || !data.reviews) {
      setMessage(data.error ?? "Unable to load reviews.");
      return;
    }

    setReviews(data.reviews);
  }

  useEffect(() => {
    void loadReviews();
  }, []);

  async function updateStatus(
    review: WebsiteReview,
    status: CustomerReviewStatus,
  ) {
    setPending(true);
    const response = await fetch(`/api/admin/reviews/${review.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = (await response.json()) as AdminReviewsResponse;
    setPending(false);

    if (!response.ok || !data.review) {
      toast.error(data.error ?? "Unable to update review.");
      return;
    }

    setReviews((current) =>
      current.map((currentReview) =>
        currentReview.id === data.review!.id ? data.review! : currentReview,
      ),
    );
    toast.success(`Review marked ${status}.`);
  }

  async function deleteReview(review: WebsiteReview) {
    const confirmed = window.confirm(`Delete review from ${review.fullName}?`);

    if (!confirmed) {
      return;
    }

    setPending(true);
    const response = await fetch(`/api/admin/reviews/${review.id}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as AdminReviewsResponse;
    setPending(false);

    if (!response.ok) {
      toast.error(data.error ?? "Unable to delete review.");
      return;
    }

    setReviews((current) =>
      current.filter((currentReview) => currentReview.id !== review.id),
    );
    toast.success("Review deleted.");
  }

  return (
    <div className="grid gap-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="font-serif text-2xl italic text-brand-script">
            Management
          </p>
          <h1 className="mt-2 font-serif text-[clamp(2.25rem,7vw,3.75rem)] text-foreground">
            Customer Reviews
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Review end-user submissions before they appear on the public
            website. Draft reviews are hidden until approved.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-sm bg-transparent"
          disabled={pending}
          onClick={() => void loadReviews()}
        >
          <RefreshCcw className="size-4" />
          Refresh
        </Button>
      </section>

      {message ? (
        <p className="rounded-sm border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {message}
        </p>
      ) : null}

      <section className="rounded-sm border border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={cn(
                "rounded-sm border px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors",
                filter === status
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted",
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <article
              key={review.id}
              className="rounded-sm border border-border bg-card p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-serif text-3xl text-foreground">
                      {review.fullName}
                    </h2>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]",
                        review.status === "approved" &&
                          "bg-primary/10 text-primary",
                        review.status === "draft" &&
                          "bg-brand-gold-soft text-secondary",
                        review.status === "rejected" &&
                          "bg-destructive/10 text-destructive",
                      )}
                    >
                      {review.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-primary">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        className={cn(
                          "size-4",
                          index < review.rating
                            ? "fill-current"
                            : "fill-transparent",
                        )}
                      />
                    ))}
                  </div>
                  {review.favoriteItem ? (
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.08em] text-primary">
                      {review.favoriteItem}
                    </p>
                  ) : null}
                  <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
                    {review.comment}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Submitted {new Date(review.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-sm"
                    disabled={pending || review.status === "approved"}
                    onClick={() => void updateStatus(review, "approved")}
                  >
                    <Check className="size-4" />
                    Approve
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-sm bg-transparent"
                    disabled={pending || review.status === "rejected"}
                    onClick={() => void updateStatus(review, "rejected")}
                  >
                    <X className="size-4" />
                    Reject
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="rounded-sm"
                    disabled={pending}
                    onClick={() => void deleteReview(review)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
              </div>

              {review.imageUrls.length > 0 ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:max-w-xl">
                  {review.imageUrls.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="block overflow-hidden rounded-sm border border-border bg-background"
                    >
                      <img
                        src={url}
                        alt={`Review image from ${review.fullName}`}
                        className="aspect-video w-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
                  <ImageIcon className="size-4" />
                  No images attached.
                </div>
              )}
            </article>
          ))
        ) : (
          <div className="rounded-sm border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            No {filter === "all" ? "" : filter} reviews found.
          </div>
        )}
      </section>
    </div>
  );
}
