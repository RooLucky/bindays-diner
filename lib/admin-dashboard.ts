import "server-only";

import { count, desc, eq, sql } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import {
  customerReviews,
  loyaltyMembers,
  managementItems,
} from "@/lib/db/schema";

export async function getAdminDashboard() {
  await requireAdminSession();
  const db = getDb();
  const [sections, members, reviews, recentItems] = await Promise.all([
    db
      .select({
        slug: managementItems.categorySlug,
        total: count(),
        active:
          sql<number>`count(*) filter (where ${managementItems.isActive} = true)`.mapWith(
            Number,
          ),
      })
      .from(managementItems)
      .groupBy(managementItems.categorySlug),
    db.select({ total: count() }).from(loyaltyMembers),
    db
      .select({ total: count() })
      .from(customerReviews)
      .where(eq(customerReviews.status, "draft")),
    db
      .select({
        id: managementItems.id,
        name: managementItems.name,
        categorySlug: managementItems.categorySlug,
        imageUrl: managementItems.imageUrl,
        updatedAt: managementItems.updatedAt,
      })
      .from(managementItems)
      .orderBy(desc(managementItems.updatedAt))
      .limit(5),
  ]);
  return {
    sections,
    members: members[0].total,
    pendingReviews: reviews[0].total,
    recentItems,
  };
}
