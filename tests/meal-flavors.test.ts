import assert from "node:assert/strict";
import { test } from "node:test";
import { parseMealFlavors, isValidMealFlavor } from "../lib/meal-flavors";
import { parseStoredCart } from "../lib/cart-data";

test("flavors trim blank lines and deduplicate without losing display names", () => {
  assert.deepEqual(parseMealFlavors(" Original\r\nSpicy\n\noriginal "), ["Original", "Spicy"]);
  assert.deepEqual(parseMealFlavors(null), []);
  assert.throws(() => parseMealFlavors("x".repeat(81)));
  assert.throws(() => parseMealFlavors(Array.from({length: 21}, (_, i) => `Flavor ${i}`).join("\n")));
});
test("saved cart preserves separate flavor selections and supports older carts", () => {
  const base = {name: "Chicken", description: "Meal", price: "P99", image: "/meal.png", source: "student-meal", quantity: 1};
  const cart = parseStoredCart([{...base, id: "a", flavor: "Spicy"}, {...base, id: "b", flavor: "Original"}, {...base, id: "old"}]);
  assert.deepEqual(cart.map(item => item.flavor), ["Spicy", "Original", undefined]);
});

test("checkout requires a current student flavor and rejects flavors on other menus", () => {
  assert.equal(isValidMealFlavor("student-meal", ["Spicy"], "Spicy"), true);
  assert.equal(isValidMealFlavor("student-meal", ["Spicy"]), false);
  assert.equal(isValidMealFlavor("student-meal", ["Spicy"], "Removed"), false);
  assert.equal(isValidMealFlavor("main-dish", [], "Spicy"), false);
  assert.equal(isValidMealFlavor("student-meal", []), true);
});
