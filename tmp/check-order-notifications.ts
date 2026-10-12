import "dotenv/config";
import assert from "node:assert/strict";
import { readOrderNotifications } from "../lib/admin-order-notifications";
async function main() {
 const initial = await readOrderNotifications(null);
 assert.ok(Number.isInteger(initial.unread) && initial.unread >= 0);
 assert.ok(Number.isFinite(Date.parse(initial.cursor)));
 const seen = await readOrderNotifications(initial.cursor);
 assert.equal(seen.unread, 0, "No existing orders should remain unread after acknowledging the latest cursor");
 console.log("PASS: database notification query and read-marker round trip. No records changed.");
}
main().catch(() => { console.error("Notification database check failed"); process.exitCode=1; });
