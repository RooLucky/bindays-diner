import "dotenv/config";
import { sql } from "drizzle-orm";
import { getDb } from "../lib/db";

async function main() {
  await getDb().execute(sql`ALTER TABLE management_items ADD COLUMN IF NOT EXISTS flavors text[] DEFAULT '{}' NOT NULL`);
  console.log("Student meal flavor column is ready; existing meals have no flavors.");
}
main().catch(() => {
  console.error("Flavor migration failed. Check database connectivity and permissions.");
  process.exitCode = 1;
});
