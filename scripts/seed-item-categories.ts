import "dotenv/config";

import { getDb } from "@/lib/db";
import { managementItemCategories } from "@/lib/db/schema";
import { getStaticManagementItemCategoryNames } from "@/lib/management";

async function seedItemCategories() {
  const names = getStaticManagementItemCategoryNames();

  for (const name of names) {
    await getDb()
      .insert(managementItemCategories)
      .values({ name })
      .onConflictDoUpdate({
        target: managementItemCategories.name,
        set: {
          name,
          updatedAt: new Date(),
        },
      });
  }

  console.log(`Seeded ${names.length} management item categories.`);
}

seedItemCategories().catch((error) => {
  console.error(error);
  process.exit(1);
});
