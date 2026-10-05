import writeXlsxFile, { type SheetData } from "write-excel-file/node";
import { type AdminOrder, orderStatusLabels } from "./order-contracts";

export function createOrdersWorkbook(orders: AdminOrder[]) {
  const headers = [
    "Order ID",
    "Placed (Asia/Manila)",
    "Customer",
    "Email",
    "Phone",
    "Delivery date",
    "Delivery time",
    "Address",
    "Landmark",
    "Items",
    "Food subtotal (PHP)",
    "Delivery fee (PHP)",
    "Total (PHP)",
    "Payment status",
    "Notes",
  ];
  const data: SheetData = [
    headers.map((value) => ({
      value,
      type: String,
      fontWeight: "bold",
      backgroundColor: "#8B1E24",
      color: "#FFFFFF",
    })),
  ];
  for (const order of orders) {
    const values = [
      order.id,
      new Date(order.createdAt).toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        hour12: false,
      }),
      order.fullName,
      order.email,
      order.phone,
      order.deliveryDate,
      order.deliveryTime,
      order.deliveryAddress,
      order.landmark ?? "",
      order.items
        .map((item) => `${item.quantity} × ${item.name} (${item.price})`)
        .join("\n"),
      order.subtotal,
      order.deliveryFee,
      order.total,
      orderStatusLabels[order.status],
      order.notes ?? "",
    ];
    // Explicit String cells preserve phone numbers and prevent user text becoming formulas.
    data.push(
      values.map((value) =>
        typeof value === "number"
          ? { value, type: Number, format: "#,##0.00" }
          : { value: value.slice(0, 32767), type: String, wrap: true },
      ),
    );
  }
  return writeXlsxFile(data, {
    columns: headers.map((_, index) => ({
      width: [7, 9, 12].includes(index) ? 48 : 24,
    })),
    sheet: "Orders",
  }).toBuffer();
}
