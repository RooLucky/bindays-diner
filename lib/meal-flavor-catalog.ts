import "server-only";
import { inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { mealFlavors } from "@/lib/db/schema";
import { parseMealFlavors } from "@/lib/meal-flavors";

export async function resolveMealFlavors(value: unknown) {
  const names = parseMealFlavors(value);
  if (!names.length) return [];
  const rows = await getDb().select().from(mealFlavors)
    .where(inArray(mealFlavors.normalizedName, names.map(name => name.toLowerCase())));
  return names.map(name => {
    const flavor = rows.find(row => row.normalizedName === name.toLowerCase());
    if (!flavor) throw new Error("Create the flavor using Add flavor before selecting it.");
    return flavor.name;
  });
}
