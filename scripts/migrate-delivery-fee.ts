import "dotenv/config";
import { sql } from "drizzle-orm";
import { getDb } from "../lib/db";

async function main() {
  await getDb().execute(
    sql`ALTER TABLE reservations ADD COLUMN IF NOT EXISTS delivery_city varchar(80)`,
  );
  await getDb().execute(
    sql`ALTER TABLE reservations ADD COLUMN IF NOT EXISTS delivery_fee integer DEFAULT 0 NOT NULL`,
  );
  console.log("Delivery columns are ready. Existing order fees remain zero.");
}
main().catch(() => {
  console.error(
    "Unable to add delivery columns. Check database connectivity and permissions.",
  );
  process.exitCode = 1;
});
