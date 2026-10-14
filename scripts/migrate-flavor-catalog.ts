import "dotenv/config";
import { sql } from "drizzle-orm";
import { getDb } from "../lib/db";

async function main() {
  await getDb().execute(sql`CREATE TABLE IF NOT EXISTS meal_flavors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(80) NOT NULL,
    normalized_name varchar(80) NOT NULL UNIQUE
  )`);
  await getDb().execute(sql`INSERT INTO meal_flavors (name, normalized_name)
    SELECT min(trim(flavor)), lower(trim(flavor))
    FROM management_items CROSS JOIN LATERAL unnest(flavors) AS flavor
    WHERE category_slug = 'student-meal' AND trim(flavor) <> ''
    GROUP BY lower(trim(flavor)) ON CONFLICT (normalized_name) DO NOTHING`);
  console.log("Flavor catalog ready. Existing student-meal flavors preserved.");
}
main().catch(() => { console.error("Unable to migrate flavor catalog."); process.exitCode = 1; });
