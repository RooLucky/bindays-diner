import { asc, eq } from "drizzle-orm";
import type { LucideIcon } from "lucide-react";

import { getDb } from "@/lib/db";
import {
  managementCategories,
  managementItems,
  type adminAccounts,
} from "@/lib/db/schema";
import {
  campaigns,
  menuDishes,
  type Campaign,
  type CampaignFeature,
  type Dish,
} from "@/lib/menu-campaigns";
import { getR2PublicUrl } from "@/lib/r2";

export const MANAGEMENT_CATEGORIES = [
  "drinks",
  "meal-of-the-day",
  "best-seller",
  "promo",
  "student-meal",
  "main-dish",
] as const;

export type ManagementCategorySlug = (typeof MANAGEMENT_CATEGORIES)[number];
export type AdminAccount = typeof adminAccounts.$inferSelect;
export type ManagementCategory = typeof managementCategories.$inferSelect;
export type ManagementItem = typeof managementItems.$inferSelect;

export type ManagementCategoryResponse = {
  slug: ManagementCategorySlug;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  heroImageKey: string | null;
  heroImageUrl: string;
  heroAlt: string;
  badge: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ManagementItemResponse = {
  id: string;
  categorySlug: ManagementCategorySlug;
  name: string;
  description: string;
  price: string;
  tag: string | null;
  imageKey: string | null;
  imageUrl: string;
  imageAlt: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ManagementPayload = {
  category: ManagementCategoryResponse;
  items: ManagementItemResponse[];
};

type StaticManagementCategory = Omit<
  ManagementCategoryResponse,
  "createdAt" | "updatedAt"
>;

const EMPTY_FEATURES: CampaignFeature[] = [];
const FALLBACK_ICON = (() => null) as unknown as LucideIcon;

export function normalizeManagementCategorySlug(value: string) {
  const normalized = value === "promos" ? "promo" : value;

  return MANAGEMENT_CATEGORIES.includes(normalized as ManagementCategorySlug)
    ? (normalized as ManagementCategorySlug)
    : null;
}

export function requireManagementCategorySlug(value: string) {
  const slug = normalizeManagementCategorySlug(value);

  if (!slug) {
    throw new Error("Unknown management category.");
  }

  return slug;
}

function staticCampaignForSlug(slug: ManagementCategorySlug) {
  if (slug === "drinks") {
    return campaigns.drinks;
  }

  if (slug === "promo") {
    return campaigns.promos;
  }

  if (slug === "student-meal") {
    return campaigns["student-meals"];
  }

  return campaigns[slug];
}

export function getStaticManagementCategory(
  slug: ManagementCategorySlug,
): StaticManagementCategory {
  const campaign = staticCampaignForSlug(slug);

  if (campaign) {
    return {
      slug,
      eyebrow: campaign.eyebrow,
      title: campaign.title,
      description: campaign.description,
      ctaLabel: campaign.ctaLabel,
      ctaHref: campaign.ctaHref,
      heroImageKey: null,
      heroImageUrl: campaign.heroImage,
      heroAlt: campaign.heroAlt,
      badge: campaign.badge ?? null,
    };
  }

  return {
    slug,
    eyebrow: "- Our Favorites -",
    title: "Featured Dishes",
    description:
      "A selection of our most loved dishes, crafted to bring you an unforgettable taste of Italy.",
    ctaLabel: "Reserve Favorites",
    ctaHref: "/reservations",
    heroImageKey: null,
    heroImageUrl: "/images/hero-pasta.png",
    heroAlt: "Featured pasta dish",
    badge: "Main Dish",
  };
}

export function getStaticManagementItems(slug: ManagementCategorySlug) {
  const campaign = staticCampaignForSlug(slug);
  const dishes = campaign?.dishes ?? menuDishes;

  return dishes.map((dish, index) => ({
    categorySlug: slug,
    name: dish.name,
    description: dish.description,
    price: dish.price,
    tag: dish.tag ?? null,
    imageKey: null,
    imageUrl: dish.image,
    imageAlt: dish.name,
    sortOrder: index,
    isActive: true,
  }));
}

export function toManagementCategoryResponse(
  category: ManagementCategory,
): ManagementCategoryResponse {
  return {
    slug: requireManagementCategorySlug(category.slug),
    eyebrow: category.eyebrow,
    title: category.title,
    description: category.description,
    ctaLabel: category.ctaLabel,
    ctaHref: category.ctaHref,
    heroImageKey: category.heroImageKey,
    heroImageUrl: resolveImageUrl(category.heroImageKey, category.heroImageUrl),
    heroAlt: category.heroAlt,
    badge: category.badge,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

export function toManagementItemResponse(
  item: ManagementItem,
): ManagementItemResponse {
  return {
    id: item.id,
    categorySlug: requireManagementCategorySlug(item.categorySlug),
    name: item.name,
    description: item.description,
    price: item.price,
    tag: item.tag,
    imageKey: item.imageKey,
    imageUrl: resolveImageUrl(item.imageKey, item.imageUrl),
    imageAlt: item.imageAlt,
    sortOrder: item.sortOrder,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function resolveImageUrl(key: string | null, storedUrl: string) {
  if (!key) {
    return storedUrl;
  }

  try {
    return getR2PublicUrl(key);
  } catch {
    return storedUrl;
  }
}

export async function getManagementPayload(slug: ManagementCategorySlug) {
  const db = getDb();
  const [category] = await db
    .select()
    .from(managementCategories)
    .where(eq(managementCategories.slug, slug))
    .limit(1);

  const items = await db
    .select()
    .from(managementItems)
    .where(eq(managementItems.categorySlug, slug))
    .orderBy(asc(managementItems.sortOrder), asc(managementItems.createdAt));

  if (!category) {
    const now = new Date().toISOString();
    return {
      category: {
        ...getStaticManagementCategory(slug),
        createdAt: now,
        updatedAt: now,
      },
      items: getStaticManagementItems(slug).map((item, index) => ({
        id: `static-${slug}-${index}`,
        ...item,
        createdAt: now,
        updatedAt: now,
      })),
    } satisfies ManagementPayload;
  }

  return {
    category: toManagementCategoryResponse(category),
    items: items.map(toManagementItemResponse),
  } satisfies ManagementPayload;
}

export async function getPublicCampaign(slug: ManagementCategorySlug) {
  const payload = await getManagementPayload(slug);
  const staticCampaign = staticCampaignForSlug(slug);

  return {
    slug: payload.category.slug,
    eyebrow: payload.category.eyebrow,
    title: payload.category.title,
    description: payload.category.description,
    ctaLabel: payload.category.ctaLabel,
    ctaHref: payload.category.ctaHref,
    heroImage: payload.category.heroImageUrl,
    heroAlt: payload.category.heroAlt,
    badge: payload.category.badge ?? undefined,
    dishes: payload.items
      .filter((item) => item.isActive)
      .map(
        (item): Dish => ({
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.imageUrl,
          tag: item.tag ?? undefined,
        }),
      ),
    features:
      staticCampaign?.features ??
      EMPTY_FEATURES.map((feature) => ({ ...feature, icon: FALLBACK_ICON })),
  } satisfies Campaign;
}

export async function getPublicMenuDishes() {
  const payload = await getManagementPayload("main-dish");

  return payload.items
    .filter((item) => item.isActive)
    .map(
      (item): Dish => ({
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.imageUrl,
        tag: item.tag ?? undefined,
      }),
    );
}
