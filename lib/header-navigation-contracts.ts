export const HEADER_MANAGED_CATEGORIES = [
  "add-ons",
  "drinks",
  "student-meal",
  "promo",
  "meal-of-the-day",
  "best-seller",
  "bilao-tray",
] as const;

export type HeaderManagedCategorySlug =
  (typeof HEADER_MANAGED_CATEGORIES)[number];

export type HeaderNavigationVisibility = Record<
  HeaderManagedCategorySlug,
  boolean
>;

export const DEFAULT_HEADER_NAVIGATION_VISIBILITY: HeaderNavigationVisibility = {
  "add-ons": true,
  drinks: true,
  "student-meal": true,
  promo: true,
  "meal-of-the-day": true,
  "best-seller": true,
  "bilao-tray": false,
};

export const HEADER_MANAGED_ROUTES: Record<HeaderManagedCategorySlug, string> = {
  "add-ons": "/add-ons",
  drinks: "/drinks",
  "student-meal": "/student-meals",
  promo: "/promos",
  "meal-of-the-day": "/meal-of-the-day",
  "best-seller": "/best-seller",
  "bilao-tray": "/bilao",
};

export function isHeaderManagedCategorySlug(
  value: string,
): value is HeaderManagedCategorySlug {
  return HEADER_MANAGED_CATEGORIES.includes(
    value as HeaderManagedCategorySlug,
  );
}
