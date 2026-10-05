export type CartItem = {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  tag?: string;
  quantity: number;
  source: string;
};
export const MAX_CART_QUANTITY = 50;
export function normalizeCartQuantity(value: number) {
  return Number.isFinite(value)
    ? Math.min(MAX_CART_QUANTITY, Math.max(1, Math.floor(value)))
    : 1;
}
export function parseStoredCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value
    .filter((item): item is CartItem => {
      if (
        !item ||
        typeof item !== "object" ||
        !["id", "name", "description", "price", "image", "source"].every(
          (key) => typeof item[key] === "string",
        ) ||
        !item.id ||
        !item.name ||
        !Number.isFinite(item.quantity) ||
        item.quantity <= 0 ||
        seen.has(item.id)
      )
        return false;
      const price = Number.parseFloat(item.price.replace(/[^0-9.]/g, ""));
      if (!Number.isFinite(price) || price <= 0) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, 50)
    .map((item) => ({
      ...item,
      tag: typeof item.tag === "string" ? item.tag : undefined,
      quantity: normalizeCartQuantity(item.quantity),
    }));
}
