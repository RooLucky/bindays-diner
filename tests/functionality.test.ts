import test from "node:test";
import assert from "node:assert/strict";
import { normalizeCartQuantity, parseStoredCart } from "../lib/cart-data";
import { isValidDeliverySchedule } from "../lib/delivery-schedule";

const item = {
  id: "meal",
  name: "Meal",
  description: "Example",
  price: "P250",
  image: "/meal.jpg",
  quantity: 2,
  source: "menu",
};
test("damaged persisted cart entries are discarded without losing valid meals", () => {
  const result = parseStoredCart([
    null,
    {},
    { ...item, price: 250 },
    item,
    item,
    { ...item, id: "bad", quantity: -2 },
  ]);
  assert.deepEqual(result, [{ ...item, tag: undefined }]);
  assert.deepEqual(parseStoredCart({}), []);
});
test("cart quantities match the API's 1–50 integer limit", () => {
  assert.equal(normalizeCartQuantity(51), 50);
  assert.equal(normalizeCartQuantity(Infinity), 1);
  assert.equal(normalizeCartQuantity(2.9), 2);
  assert.equal(parseStoredCart([{ ...item, quantity: 999 }])[0].quantity, 50);
});
test("delivery dates are real future calendar dates in Philippine time", () => {
  const now = Date.parse("2026-10-05T02:00:00Z");
  assert.equal(isValidDeliverySchedule("2026-10-05", "10:01", now), true);
  assert.equal(isValidDeliverySchedule("2026-10-05", "09:59", now), false);
  assert.equal(isValidDeliverySchedule("2027-02-30", "12:00", now), false);
  assert.equal(isValidDeliverySchedule("2026-10-06", "25:00", now), false);
  assert.equal(isValidDeliverySchedule("2028-02-29", "12:00", now), true);
});
