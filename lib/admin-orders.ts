import "server-only";
import { desc, or, ilike, eq, sql, count } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { reservations } from "@/lib/db/schema";
import { requireAdminApiSession } from "@/lib/admin-auth";
import { and } from "drizzle-orm";
import { orderStatuses, type AdminOrder } from "@/lib/order-contracts";

export async function readAdminOrders(
  params: URLSearchParams,
  exporting = false,
) {
  if (!(await requireAdminApiSession())) throw new Error("Unauthorized");
  const page = Math.max(
    1,
    Math.min(100000, Number.parseInt(params.get("page") ?? "1", 10) || 1),
  );
  const query = (params.get("q") ?? "").trim().slice(0, 160);
  const status = params.get("status") ?? "all";
  const effectiveStatus = sql<
    AdminOrder["status"]
  >`case when ${reservations.paymentStatus} = 'paid' then 'paid' when ${reservations.receiptKey} is not null then 'awaiting-verification' when ${reservations.paymentStatus} = 'unpaid' or ${reservations.paymentLinkExpiresAt} <= now() then 'unpaid' else 'pending' end`;
  const where = and(
    query
      ? or(
          ilike(reservations.fullName, `%${query}%`),
          ilike(reservations.email, `%${query}%`),
          ilike(reservations.phone, `%${query}%`),
          ilike(sql`${reservations.id}::text`, `%${query}%`),
        )
      : undefined,
    orderStatuses.includes(status as AdminOrder["status"])
      ? eq(effectiveStatus, status)
      : undefined,
  );
  const db = getDb();
  const [{ total }] = await db
    .select({ total: count() })
    .from(reservations)
    .where(where);
  if (exporting && total > 10000)
    throw new Error(
      "Narrow your filters to export no more than 10,000 orders.",
    );
  const rows = await db
    .select({
      id: reservations.id,
      fullName: reservations.fullName,
      email: reservations.email,
      phone: reservations.phone,
      deliveryAddress: reservations.deliveryAddress,
      landmark: reservations.landmark,
      deliveryDate: reservations.deliveryDate,
      deliveryTime: reservations.deliveryTime,
      notes: reservations.notes,
      itemsJson: reservations.itemsJson,
      subtotal: reservations.subtotal,
      deliveryFee: reservations.deliveryFee,
      status: effectiveStatus,
      createdAt: reservations.createdAt,
    })
    .from(reservations)
    .where(where)
    .orderBy(desc(reservations.createdAt), desc(reservations.id))
    .limit(exporting ? 10000 : 25)
    .offset(exporting ? 0 : (page - 1) * 25);
  const orders: AdminOrder[] = rows.map(({ itemsJson, createdAt, ...row }) => {
    let items: AdminOrder["items"] = [];
    try {
      const parsed = JSON.parse(itemsJson);
      if (Array.isArray(parsed))
        items = parsed.filter(
          (item) =>
            typeof item.name === "string" &&
            typeof item.price === "string" &&
            Number.isFinite(item.quantity),
        );
    } catch {
      /* Keep historical order details available even if item data is malformed. */
    }
    return {
      ...row,
      total: row.subtotal + row.deliveryFee,
      items,
      createdAt: createdAt.toISOString(),
    };
  });
  return { orders, total, page, pageSize: 25 };
}
