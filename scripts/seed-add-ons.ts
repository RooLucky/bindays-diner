import "dotenv/config";

import { getDb } from "@/lib/db";
import { managementCategories, managementItems } from "@/lib/db/schema";
import {
  getStaticManagementCategory,
  getStaticManagementItems,
} from "@/lib/management";

async function seedAddOns() {
  const slug = "add-ons" as const;
  const category = getStaticManagementCategory(slug);
  const items = getStaticManagementItems(slug);
  const db = getDb();

  await db
    .insert(managementCategories)
    .values(category)
    .onConflictDoNothing({ target: managementCategories.slug });

  for (const item of items) {
    await db
      .insert(managementItems)
      .values(item)
      .onConflictDoNothing({
        target: [managementItems.categorySlug, managementItems.name],
      });
  }

  console.log(`Seeded add-ons management content with ${items.length} items.`);
}

seedAddOns().catch((error) => {
  console.error(error);
  process.exit(1);
});
