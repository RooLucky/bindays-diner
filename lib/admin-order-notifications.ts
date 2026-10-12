import "server-only";
import { getDb } from "@/lib/db";
import { reservations } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

// Called only after staff authentication by the notification route.
export async function readOrderNotifications(since: string | null) {
  const [result] = await getDb()
    .select({
      unread: sql<number>`count(*) filter (where ${reservations.createdAt} > ${since ?? "1970-01-01T00:00:00Z"}::timestamptz)::int`,
      cursor: sql<string>`coalesce(max(${reservations.createdAt}), '1970-01-01'::timestamptz)::text`,
    })
    .from(reservations);
  return result;
}
