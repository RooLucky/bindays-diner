export type LoyaltyCardResponse = {
  member: {
    memberCode: string;
    fullName: string;
    birthday: string;
    phone: string | null;
    createdAt: string;
  };
  qrUrl: string;
  rewardThreshold: number;
  currentCycle: number;
  stampCount: number;
  stampedNumbers: number[];
  rewardReady: boolean;
  redeemed: boolean;
  recentStamps: Array<{
    id: string;
    stampNumber: number;
    rewardCycle: number;
    source: "online" | "physical" | "manual";
    note: string | null;
    createdAt: string;
  }>;
};

