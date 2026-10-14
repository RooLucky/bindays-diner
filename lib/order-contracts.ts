export const orderStatuses = [
  "pending",
  "awaiting-verification",
  "unpaid",
  "paid",
] as const;
export type OrderStatus = (typeof orderStatuses)[number];
export type AdminOrder = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  landmark: string | null;
  deliveryDate: string;
  deliveryTime: string;
  notes: string | null;
  items: { name: string; price: string; quantity: number; flavor?: string }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  hasReceipt?: boolean;
  createdAt: string;
};
export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Awaiting payment",
  "awaiting-verification": "Receipt submitted",
  unpaid: "Expired / unpaid",
  paid: "Paid",
};
