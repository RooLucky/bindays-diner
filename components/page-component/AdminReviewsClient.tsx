"use client";

import { AdminPanel } from "@/components/admin/AdminPanel";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Edit3,
  ImageIcon,
  RefreshCcw,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DeleteConfirmationDialog } from "@/components/admin/DeleteConfirmationDialog";
import { AdminDialogPopup } from "@/components/admin/AdminDialog";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogDescription,
  DialogPortal,
  DialogTitle,
  DialogViewport,
} from "@/components/ui/dialog";
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
  const [filter, setFilter] = useState<(typeof statusFilters)[number]>("draft");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WebsiteReview | null>(null);
  const [editingReview, setEditingReview] = useState<WebsiteReview | null>(
    null,
  );
  const [editOpen, setEditOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<CustomerReviewStatus>("draft");

  const filteredReviews = useMemo(() => {
    if (filter === "all") {
      return reviews;
    }

    return reviews.filter((review) => review.status === filter);
  }, [filter, reviews]);

  async function loadReviews() {
    try {
      setPending(true);
      setMessage("");

      const response = await fetch("/api/admin/reviews", { cache: "no-store" });
      const data = (await response.json()) as AdminReviewsResponse;

      if (!response.ok || !data.reviews) {
        setMessage(data.error ?? "Unable to load reviews.");
        return;
      }

      setReviews(data.reviews);
    } catch {
      setMessage("Unable to load reviews. Please try again.");
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    void loadReviews();
  }, []);

  async function updateStatus(
    review: WebsiteReview,
    status: CustomerReviewStatus,
  ) {
    try {
      setPending(true);
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await response.json()) as AdminReviewsResponse;

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
      setEditOpen(false);
    } catch {
      toast.error("Unable to save this review. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function deleteReview(review: WebsiteReview) {
    const response = await fetch(`/api/admin/reviews/${review.id}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as AdminReviewsResponse;

    if (!response.ok) {
      toast.error(data.error ?? "Unable to delete review.");
      return false;
    }

    setReviews((current) =>
      current.filter((currentReview) => currentReview.id !== review.id),
    );
    toast.success("Review deleted.");
    return true;
  }

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        title="Customer reviews"
        description="Review customer submissions and choose which reviews to publish."
      >
        <Button
          type="button"
          variant="outline"
          className="rounded-lg bg-transparent"
          disabled={pending}
          onClick={() => void loadReviews()}
        >
          <RefreshCcw className="size-4" />
          Refresh
        </Button>
      </AdminPageHeader>
      <DeleteConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this review?"
        description={`The review from ${deleteTarget?.fullName ?? "this customer"} will be permanently removed. This action cannot be undone.`}
        onConfirm={() =>
          deleteTarget ? deleteReview(deleteTarget) : Promise.resolve(false)
        }
      />

      {message ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {message}
        </p>
      ) : null}

      <AdminPanel className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={cn(
                "rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors",
                filter === status
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted",
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </AdminPanel>

      <section className="grid gap-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <AdminPanel
              key={review.id}
              className="rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                      {review.fullName}
                    </h2>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                        review.status === "approved" &&
                          "bg-brand-gold-soft text-brand-olive",
                        review.status === "draft" &&
                          "bg-muted text-muted-foreground",
                        review.status === "rejected" &&
                          "bg-destructive/10 text-destructive",
                      )}
                    >
                      {review.status}
                    </Badge>
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
                    className="rounded-lg"
                    disabled={pending}
                    onClick={() => {
                      setEditingReview(review);
                      setEditStatus(review.status);
                      setEditOpen(true);
                    }}
                  >
                    <Edit3 className="size-4" />
                    Review
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="rounded-lg"
                    disabled={pending}
                    onClick={() => {
                      setDeleteTarget(review);
                      setDeleteOpen(true);
                    }}
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
                      className="block overflow-hidden rounded-lg border border-border bg-background"
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
            </AdminPanel>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
            No {filter === "all" ? "" : filter} reviews found.
          </div>
        )}
      </section>
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!pending) setEditOpen(open);
        }}
      >
        <DialogPortal>
          <DialogBackdrop />
          <DialogViewport>
            <AdminDialogPopup className="max-w-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-lg font-semibold">
                    Review submission
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm text-muted-foreground">
                    Choose whether to publish this customer review.
                  </DialogDescription>
                </div>
                <DialogClose
                  render={
                    <Button variant="ghost" size="icon-sm" disabled={pending} />
                  }
                  aria-label="Close review dialog"
                >
                  <X />
                </DialogClose>
              </div>
              <div className="mt-5 rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-semibold">
                  {editingReview?.fullName}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {editingReview?.comment}
                </p>
              </div>
              <form
                className="mt-5 grid gap-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (editingReview)
                    void updateStatus(editingReview, editStatus);
                }}
              >
                <label className="grid gap-2 text-sm font-medium">
                  Publication status
                  <select
                    value={editStatus}
                    onChange={(event) =>
                      setEditStatus(event.target.value as CustomerReviewStatus)
                    }
                    className="h-10 rounded-lg border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="draft">Draft — hidden from guests</option>
                    <option value="approved">
                      Approved — visible on website
                    </option>
                    <option value="rejected">
                      Rejected — hidden from guests
                    </option>
                  </select>
                </label>
                <div className="flex justify-end gap-2">
                  <DialogClose
                    render={
                      <Button
                        variant="outline"
                        className="rounded-lg"
                        disabled={pending}
                      />
                    }
                  >
                    Cancel
                  </DialogClose>
                  <Button
                    type="submit"
                    className="rounded-lg"
                    disabled={pending}
                  >
                    <Check />
                    {pending ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </form>
            </AdminDialogPopup>
          </DialogViewport>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
