import "dotenv/config";

import { getDb } from "@/lib/db";
import {
  managementCategories,
  managementItemCategories,
  managementItems,
} from "@/lib/db/schema";
import {
  getStaticManagementCategory,
  getStaticManagementItems,
  type ManagementCategorySlug,
} from "@/lib/management";
import { MAIN_MENU_SEED_ITEMS } from "@/lib/main-menu-seed-data";

async function seedMainMenu() {
  const db = getDb();
  let totalItems = 0;

  for (const slug of Object.keys(MAIN_MENU_SEED_ITEMS) as ManagementCategorySlug[]) {
    const category = getStaticManagementCategory(slug);
    const items = getStaticManagementItems(slug);

    await db
      .insert(managementCategories)
      .values(category)
      .onConflictDoNothing({ target: managementCategories.slug });

    for (const menuItem of items) {
      await db
        .insert(managementItems)
        .values(menuItem)
        .onConflictDoUpdate({
          target: [managementItems.categorySlug, managementItems.name],
          set: {
            description: menuItem.description,
            price: menuItem.price,
            tag: menuItem.tag,
            imageKey: menuItem.imageKey,
            imageUrl: menuItem.imageUrl,
            imageAlt: menuItem.imageAlt,
            sortOrder: menuItem.sortOrder,
            isActive: menuItem.isActive,
            updatedAt: new Date(),
          },
        });
    }

    totalItems += items.length;
    console.log(`Seeded ${items.length} items into "${slug}".`);
  }

  const categoryNames = Array.from(
    new Set(
      Object.values(MAIN_MENU_SEED_ITEMS).flatMap((items) =>
        items.map((menuItem) => menuItem.tag),
      ),
    ),
  );

  for (const name of categoryNames) {
    await db
      .insert(managementItemCategories)
      .values({ name })
      .onConflictDoUpdate({
        target: managementItemCategories.name,
        set: { name, updatedAt: new Date() },
      });
  }

  console.log(
    `Seeded ${totalItems} Main Menu items and ${categoryNames.length} category labels.`,
  );
}

seedMainMenu().catch((error) => {
  console.error(error);
  process.exit(1);
});
