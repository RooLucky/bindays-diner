export const MINIMUM_ORDER_PESOS = 500;
export const DELIVERY_FEE_PESOS = 50;
export const DELIVERY_CITY = "Legazpi City";
export const FOODPANDA_ORDER_URL =
  "https://www.foodpanda.ph/restaurant/elr0/bindays-diner";
export function meetsMinimumOrder(total: number) {
  return Number.isFinite(total) && total >= MINIMUM_ORDER_PESOS;
}
