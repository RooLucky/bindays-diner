export type ReservationPaymentStatus = "pending" | "unpaid" | "paid";

export type ReservationItem = {
  name: string;
  price: string;
  quantity: number;
};

export type ReservationPaymentDetails = {
  id: string;
  fullName: string;
  deliveryDate: string;
  deliveryTime: string;
  items: ReservationItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentStatus: ReservationPaymentStatus;
  paymentLinkExpiresAt: string;
  paidAt: string | null;
  receiptSubmitted: boolean;
};
