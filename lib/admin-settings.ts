import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { adminSettings } from "@/lib/db/schema";
import { getServerEnv } from "@/lib/env";
import { verifySecret } from "@/lib/secrets";

export const LOYALTY_STAMP_PIN_KEY = "loyalty_stamp_pin";

export async function verifyLoyaltyStampPin(pin: string) {
  const [setting] = await getDb()
    .select()
    .from(adminSettings)
    .where(eq(adminSettings.key, LOYALTY_STAMP_PIN_KEY))
    .limit(1);

  if (setting) {
    return verifySecret(pin, setting.valueHash);
  }

  const envPin = getServerEnv().LOYALTY_STAMP_PIN;

  return Boolean(envPin && pin === envPin);
}
