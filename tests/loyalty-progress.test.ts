import assert from "node:assert/strict";
import { test } from "node:test";

import { getLoyaltyProgress } from "../lib/loyalty-progress";

function stamps(count: number, rewardCycle = 1) {
  return Array.from({ length: count }, (_, index) => ({
    rewardCycle,
    stampNumber: index + 1,
  }));
}

test("new and partially stamped cards stay in the current cycle", () => {
  for (const count of [0, 1, 9]) {
    const card = getLoyaltyProgress(stamps(count), []);
    assert.equal(card.currentCycle, 1);
    assert.equal(card.stampCount, count);
    assert.equal(card.rewardReady, false);
  }
});

test("the tenth stamp immediately resets the card and preserves its earned reward", () => {
  const history = stamps(10);
  const card = getLoyaltyProgress(history, []);
  assert.equal(card.currentCycle, 2);
  assert.equal(card.stampCount, 0);
  assert.deepEqual(card.stampedNumbers, []);
  assert.deepEqual(card.pendingRewardCycles, [1]);
  assert.equal(card.rewardReady, true);
  assert.equal(history.length, 10);
});

test("new stamps accumulate before the previous reward is redeemed", () => {
  const history = [...stamps(10), ...stamps(3, 2)];
  const card = getLoyaltyProgress(history, []);
  assert.equal(card.currentCycle, 2);
  assert.deepEqual(card.stampedNumbers, [1, 2, 3]);
  assert.equal(card.pendingRewardCount, 1);

  const afterRedemption = getLoyaltyProgress(history, [{ rewardCycle: 1 }]);
  assert.equal(afterRedemption.currentCycle, 2);
  assert.deepEqual(afterRedemption.stampedNumbers, [1, 2, 3]);
  assert.equal(afterRedemption.rewardReady, false);
  assert.equal(afterRedemption.redeemedRewardCount, 1);
});

test("multiple completed cards reset repeatedly and retain each unclaimed reward", () => {
  const history = [...stamps(10), ...stamps(10, 2)];
  const card = getLoyaltyProgress(history, []);
  assert.equal(card.currentCycle, 3);
  assert.equal(card.stampCount, 0);
  assert.deepEqual(card.pendingRewardCycles, [1, 2]);
  assert.equal(card.pendingRewardCount, 2);

  const afterRedemption = getLoyaltyProgress(history, [{ rewardCycle: 1 }]);
  assert.deepEqual(afterRedemption.pendingRewardCycles, [2]);
  assert.equal(afterRedemption.currentCycle, 3);
});

test("previously redeemed cards start empty without requiring another stamp", () => {
  const card = getLoyaltyProgress(stamps(10), [{ rewardCycle: 1 }]);
  assert.equal(card.currentCycle, 2);
  assert.equal(card.stampCount, 0);
  assert.equal(card.rewardReady, false);
});

test("duplicate history does not earn extra rewards or fill missing slots", () => {
  const card = getLoyaltyProgress([...stamps(9), ...stamps(1)], []);
  assert.equal(card.currentCycle, 1);
  assert.equal(card.stampCount, 9);
  assert.equal(card.rewardReady, false);

  const redeemed = getLoyaltyProgress(stamps(10), [{ rewardCycle: 1 }, { rewardCycle: 1 }]);
  assert.equal(redeemed.redeemedRewardCount, 1);
  assert.equal(redeemed.pendingRewardCount, 0);
});
