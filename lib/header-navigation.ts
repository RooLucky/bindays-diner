import "server-only";

import { getDb } from "@/lib/db";
import { managementCategories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  DEFAULT_HEADER_NAVIGATION_VISIBILITY,
  type HeaderManagedCategorySlug,
  isHeaderManagedCategorySlug,
  type HeaderNavigationVisibility,
} from "@/lib/header-navigation-contracts";

export async function getHeaderNavigationVisibility(): Promise<HeaderNavigationVisibility> {
  const visibility = { ...DEFAULT_HEADER_NAVIGATION_VISIBILITY };

  try {
    const categories = await getDb()
      .select({
        slug: managementCategories.slug,
        isHeaderActive: managementCategories.isHeaderActive,
      })
      .from(managementCategories);

    for (const category of categories) {
      if (isHeaderManagedCategorySlug(category.slug)) {
        visibility[category.slug] = category.isHeaderActive;
      }
    }
  } catch (error) {
    console.warn("Unable to load header navigation visibility.", error);
  }

  return visibility;
}

export async function isHeaderRouteActive(
  categorySlug: HeaderManagedCategorySlug,
) {
  try {
    const [category] = await getDb()
      .select({
        isHeaderActive: managementCategories.isHeaderActive,
      })
      .from(managementCategories)
      .where(eq(managementCategories.slug, categorySlug))
      .limit(1);

    return category?.isHeaderActive ?? true;
  } catch (error) {
    console.warn("Unable to verify header route visibility.", error);
    return true;
  }
}

export async function requireActiveHeaderRoute(
  categorySlug: HeaderManagedCategorySlug,
) {
  if (!(await isHeaderRouteActive(categorySlug))) {
    notFound();
  }
}
