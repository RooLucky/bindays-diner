import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { customerReviews, googleReviewCache } from "@/lib/db/schema";
import { getServerEnv } from "@/lib/env";
import { deleteR2Object, uploadR2Object } from "@/lib/r2";
import type {
  CustomerReviewStatus,
  GoogleReviewSnippet,
  GoogleReviewSummary,
  PublicReviewsPayload,
  WebsiteReview,
} from "@/lib/review-contracts";

const GOOGLE_CACHE_TTL_MS = 6 * 60 * 60 * 1_000;
const MAX_GOOGLE_REVIEWS = 5;
const MAX_CUSTOMER_REVIEWS = 6;
const MAX_REVIEW_IMAGES = 2;
const MAX_REVIEW_IMAGE_SIZE = 5 * 1024 * 1024;

const customerReviewFieldsSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(8).max(700),
  favoriteItem: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value ? value : null)),
  captchaExpected: z.coerce.number().int().min(0).max(50),
  captchaAnswer: z.coerce.number().int().min(0).max(50),
  company: z.string().optional(),
});

const reviewStatusSchema = z.enum(["draft", "approved", "rejected"]);

type GooglePlaceResponse = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: Array<{
    name?: string;
    rating?: number;
    relativePublishTimeDescription?: string;
    text?: {
      text?: string;
    };
    authorAttribution?: {
      displayName?: string;
    };
  }>;
};

function getGoogleReviewUrl() {
  const env = getServerEnv();

  if (env.GOOGLE_REVIEW_URL) {
    return env.GOOGLE_REVIEW_URL;
  }

  if (env.GOOGLE_PLACE_ID) {
    return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(
      env.GOOGLE_PLACE_ID,
    )}`;
  }

  return "https://www.google.com/maps/search/?api=1&query=Binday%27s%20Diner%20Legazpi%20City";
}

function parseGoogleReviews(reviewsJson: string): GoogleReviewSnippet[] {
  try {
    const parsed = JSON.parse(reviewsJson);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isGoogleReviewSnippet);
  } catch {
    return [];
  }
}

function parseStringArray(value: string) {
  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function safeFilename(name: string) {
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized || "review-image";
}

function getOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function getReviewImageFiles(formData: FormData) {
  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length > MAX_REVIEW_IMAGES) {
    throw new Error("Upload only up to 2 review images.");
  }

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Review uploads must be image files.");
    }

    if (file.size > MAX_REVIEW_IMAGE_SIZE) {
      throw new Error("Each review image must be 5MB or smaller.");
    }
  }

  return files;
}

async function uploadReviewImages(files: File[]) {
  const uploadedImages: Array<{ key: string; url: string }> = [];

  for (const file of files) {
    const key = `reviews/${randomUUID()}-${safeFilename(file.name)}`;
    const url = await uploadR2Object({
      key,
      body: Buffer.from(await file.arrayBuffer()),
      contentType: file.type || "application/octet-stream",
    });

    uploadedImages.push({ key, url });
  }

  return uploadedImages;
}

function toWebsiteReview(row: typeof customerReviews.$inferSelect): WebsiteReview {
  return {
    id: row.id,
    fullName: row.fullName,
    rating: row.rating,
    comment: row.comment,
    favoriteItem: row.favoriteItem,
    status: row.status,
    imageUrls: parseStringArray(row.imageUrlsJson),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function isGoogleReviewSnippet(value: unknown): value is GoogleReviewSnippet {
  if (!value || typeof value !== "object") {
    return false;
  }

  const review = value as Partial<GoogleReviewSnippet>;

  return (
    typeof review.authorName === "string" &&
    typeof review.rating === "number" &&
    typeof review.text === "string"
  );
}

function mapGoogleReviews(
  reviews: GooglePlaceResponse["reviews"],
): GoogleReviewSnippet[] {
  return (reviews ?? [])
    .slice(0, MAX_GOOGLE_REVIEWS)
    .map((review) => ({
      authorName: review.authorAttribution?.displayName ?? "Google reviewer",
      rating: Math.min(5, Math.max(1, Math.round(review.rating ?? 5))),
      text: review.text?.text ?? "",
      relativeTime: review.relativePublishTimeDescription ?? null,
    }))
    .filter((review) => review.text.length > 0);
}

async function refreshGoogleReviewSummary() {
  const env = getServerEnv();

  if (!env.GOOGLE_MAPS_API_KEY || !env.GOOGLE_PLACE_ID) {
    return null;
  }

  const response = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(
      env.GOOGLE_PLACE_ID,
    )}?languageCode=en`,
    {
      headers: {
        "X-Goog-Api-Key": env.GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask":
          "rating,userRatingCount,googleMapsUri,reviews.rating,reviews.text,reviews.relativePublishTimeDescription,reviews.authorAttribution.displayName",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to fetch Google review summary.");
  }

  const place = (await response.json()) as GooglePlaceResponse;
  const reviews = mapGoogleReviews(place.reviews);
  const now = new Date();

  const [cached] = await getDb()
    .insert(googleReviewCache)
    .values({
      placeId: env.GOOGLE_PLACE_ID,
      rating:
        typeof place.rating === "number" ? place.rating.toFixed(1) : null,
      userRatingCount: place.userRatingCount ?? null,
      googleMapsUrl: place.googleMapsUri ?? getGoogleReviewUrl(),
      reviewsJson: JSON.stringify(reviews),
      fetchedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: googleReviewCache.placeId,
      set: {
        rating:
          typeof place.rating === "number" ? place.rating.toFixed(1) : null,
        userRatingCount: place.userRatingCount ?? null,
        googleMapsUrl: place.googleMapsUri ?? getGoogleReviewUrl(),
        reviewsJson: JSON.stringify(reviews),
        fetchedAt: now,
        updatedAt: now,
      },
    })
    .returning();

  return cached;
}

export async function getGoogleReviewSummary(): Promise<GoogleReviewSummary> {
  const env = getServerEnv();
  const fallback: GoogleReviewSummary = {
    rating: null,
    userRatingCount: null,
    googleMapsUrl: getGoogleReviewUrl(),
    reviews: [],
    isConfigured: Boolean(env.GOOGLE_MAPS_API_KEY && env.GOOGLE_PLACE_ID),
  };

  if (!env.GOOGLE_PLACE_ID) {
    return fallback;
  }

  try {
    const [cached] = await getDb()
      .select()
      .from(googleReviewCache)
      .where(eq(googleReviewCache.placeId, env.GOOGLE_PLACE_ID))
      .limit(1);

    const isFresh =
      cached &&
      Date.now() - cached.fetchedAt.getTime() < GOOGLE_CACHE_TTL_MS;
    const summary = isFresh ? cached : await refreshGoogleReviewSummary();
    const source = summary ?? cached;

    if (!source) {
      return fallback;
    }

    return {
      rating: source.rating,
      userRatingCount: source.userRatingCount,
      googleMapsUrl: source.googleMapsUrl ?? fallback.googleMapsUrl,
      reviews: parseGoogleReviews(source.reviewsJson),
      isConfigured: fallback.isConfigured,
    };
  } catch (error) {
    console.warn("Unable to load Google reviews.", error);
    return fallback;
  }
}

export async function listPublicCustomerReviews() {
  const rows = await getDb()
    .select()
    .from(customerReviews)
    .where(
      and(
        eq(customerReviews.status, "approved"),
        eq(customerReviews.isApproved, true),
      ),
    )
    .orderBy(desc(customerReviews.createdAt))
    .limit(MAX_CUSTOMER_REVIEWS);

  return rows.map(toWebsiteReview);
}

export async function getWebsiteReviewRating() {
  const rows = await getDb()
    .select({
      rating: customerReviews.rating,
    })
    .from(customerReviews)
    .where(
      and(
        eq(customerReviews.status, "approved"),
        eq(customerReviews.isApproved, true),
      ),
    );

  if (rows.length === 0) {
    return {
      average: null,
      count: 0,
    };
  }

  const total = rows.reduce((sum, review) => sum + review.rating, 0);

  return {
    average: (total / rows.length).toFixed(1),
    count: rows.length,
  };
}

export async function getPublicReviewsPayload(): Promise<PublicReviewsPayload> {
  const [google, reviews, websiteRating] = await Promise.all([
    getGoogleReviewSummary(),
    listPublicCustomerReviews(),
    getWebsiteReviewRating(),
  ]);

  return { google, reviews, websiteRating };
}

export async function createCustomerReview(formData: FormData) {
  const parsed = customerReviewFieldsSchema.parse({
    fullName: getOptionalString(formData, "fullName"),
    rating: getOptionalString(formData, "rating"),
    comment: getOptionalString(formData, "comment"),
    favoriteItem: getOptionalString(formData, "favoriteItem"),
    captchaExpected: getOptionalString(formData, "captchaExpected"),
    captchaAnswer: getOptionalString(formData, "captchaAnswer"),
    company: getOptionalString(formData, "company") ?? "",
  });

  if (parsed.company) {
    throw new Error("Unable to submit this review.");
  }

  if (parsed.captchaAnswer !== parsed.captchaExpected) {
    throw new Error("Please answer the anti-bot question correctly.");
  }

  const [recentDuplicate] = await getDb()
    .select({ id: customerReviews.id })
    .from(customerReviews)
    .where(
      and(
        eq(customerReviews.fullName, parsed.fullName),
        eq(customerReviews.comment, parsed.comment),
      ),
    )
    .limit(1);

  if (recentDuplicate) {
    throw new Error("This review has already been submitted.");
  }

  const uploadedImages = await uploadReviewImages(getReviewImageFiles(formData));

  try {
    const [created] = await getDb()
      .insert(customerReviews)
      .values({
        fullName: parsed.fullName,
        rating: parsed.rating,
        comment: parsed.comment,
        favoriteItem: parsed.favoriteItem,
        status: "draft",
        isApproved: false,
        imageKeysJson: JSON.stringify(
          uploadedImages.map((image) => image.key),
        ),
        imageUrlsJson: JSON.stringify(
          uploadedImages.map((image) => image.url),
        ),
      })
      .returning();

    return toWebsiteReview(created);
  } catch (error) {
    await Promise.all(
      uploadedImages.map((image) => deleteR2Object(image.key)),
    );
    throw error;
  }
}

export async function listAdminCustomerReviews() {
  const rows = await getDb()
    .select()
    .from(customerReviews)
    .orderBy(desc(customerReviews.createdAt));

  return rows.map(toWebsiteReview);
}

export async function updateCustomerReviewStatus(input: {
  id: string;
  status: CustomerReviewStatus;
}) {
  const status = reviewStatusSchema.parse(input.status);
  const [updated] = await getDb()
    .update(customerReviews)
    .set({
      status,
      isApproved: status === "approved",
      updatedAt: new Date(),
    })
    .where(eq(customerReviews.id, input.id))
    .returning();

  if (!updated) {
    throw new Error("Review not found.");
  }

  return toWebsiteReview(updated);
}

export async function deleteCustomerReview(id: string) {
  const [review] = await getDb()
    .select()
    .from(customerReviews)
    .where(eq(customerReviews.id, id))
    .limit(1);

  if (!review) {
    throw new Error("Review not found.");
  }

  await Promise.all(
    parseStringArray(review.imageKeysJson).map((key) => deleteR2Object(key)),
  );
  await getDb().delete(customerReviews).where(eq(customerReviews.id, id));
}
