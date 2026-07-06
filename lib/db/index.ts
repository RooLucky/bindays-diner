import { drizzle } from "drizzle-orm/neon-http";

import { getServerEnv } from "@/lib/env";

let db: ReturnType<typeof createDb> | undefined;

function createDb() {
  return drizzle(getServerEnv().DATABASE_URL);
}

export function getDb() {
  db ??= createDb();
  return db;
}
