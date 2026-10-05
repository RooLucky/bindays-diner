import test from "node:test";
import assert from "node:assert/strict";
import { meetsMinimumOrder } from "../lib/order-policy";
import { createOrdersWorkbook } from "../lib/orders-workbook";

test("direct orders require at least PHP 500, including the exact boundary", () => {
  for (const amount of [0, -1, 499, 499.99, NaN, Infinity])
    assert.equal(meetsMinimumOrder(amount), false);
  for (const amount of [500, 500.01, 1000])
    assert.equal(meetsMinimumOrder(amount), true);
});
test("Excel export creates real XLSX files, including empty filtered results", async () => {
  const workbook = await createOrdersWorkbook([]);
  assert.equal(workbook.subarray(0, 2).toString(), "PK");
  assert.ok(workbook.length > 1000);
});
