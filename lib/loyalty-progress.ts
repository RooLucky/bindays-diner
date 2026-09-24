export const LOYALTY_REWARD_THRESHOLD = 10;

type Stamp = { rewardCycle: number; stampNumber: number };
type Redemption = { rewardCycle: number };

export function getLoyaltyProgress(stamps: Stamp[], redemptions: Redemption[]) {
  const stampsByCycle = new Map<number, Set<number>>();
  const redeemedCycles = new Set(redemptions.map(({ rewardCycle }) => rewardCycle));
  let latestCycle = 1;

  for (const stamp of stamps) {
    latestCycle = Math.max(latestCycle, stamp.rewardCycle);
    const numbers = stampsByCycle.get(stamp.rewardCycle) ?? new Set<number>();
    if (stamp.stampNumber >= 1 && stamp.stampNumber <= LOYALTY_REWARD_THRESHOLD) {
      numbers.add(stamp.stampNumber);
    }
    stampsByCycle.set(stamp.rewardCycle, numbers);
  }
  for (const cycle of redeemedCycles) {
    latestCycle = Math.max(latestCycle, cycle);
  }

  // Completed cards remain in history as earned rewards. The visible card
  // advances immediately, even when staff have not redeemed the reward yet.
  const latestComplete =
    (stampsByCycle.get(latestCycle)?.size ?? 0) >= LOYALTY_REWARD_THRESHOLD;
  const currentCycle = latestComplete || redeemedCycles.has(latestCycle)
    ? latestCycle + 1
    : latestCycle;
  const stampedNumbers = [...(stampsByCycle.get(currentCycle) ?? [])].sort((a, b) => a - b);
  const pendingRewardCycles = [...stampsByCycle.entries()]
    .filter(([cycle, numbers]) =>
      numbers.size >= LOYALTY_REWARD_THRESHOLD && !redeemedCycles.has(cycle),
    )
    .map(([cycle]) => cycle)
    .sort((a, b) => a - b);

  return {
    rewardThreshold: LOYALTY_REWARD_THRESHOLD,
    currentCycle,
    stampCount: stampedNumbers.length,
    stampedNumbers,
    pendingRewardCycles,
    pendingRewardCount: pendingRewardCycles.length,
    rewardReady: pendingRewardCycles.length > 0,
    redeemedRewardCount: redeemedCycles.size,
  };
}
