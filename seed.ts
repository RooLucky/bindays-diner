import "dotenv/config";

import { randomBytes } from "node:crypto";

import { LOYALTY_STAMP_PIN_KEY } from "@/lib/admin-settings";
import { getDb } from "@/lib/db";
import { adminAccounts, adminSettings } from "@/lib/db/schema";
import { getServerEnv } from "@/lib/env";
import { hashSecret } from "@/lib/secrets";

const DEFAULT_ADMIN_EMAIL = "admin@bindays.local";

function getSeedAdminConfig() {
  const env = getServerEnv();
  const missingCredentials = !env.ADMIN_EMAIL || !env.ADMIN_PASSWORD;

  if (process.env.NODE_ENV === "production" && missingCredentials) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required to seed admin accounts.");
  }

  const generatedPassword = env.ADMIN_PASSWORD
    ? undefined
    : `Bindays-${randomBytes(12).toString("base64url")}`;
  const password = env.ADMIN_PASSWORD ?? generatedPassword;

  if (!password) {
    throw new Error("ADMIN_PASSWORD is required to seed admin accounts.");
  }

  return {
    email: env.ADMIN_EMAIL?.trim().toLowerCase() || DEFAULT_ADMIN_EMAIL,
    password,
    fullName: env.ADMIN_NAME?.trim() || "Bindays Admin",
    generatedPassword,
  };
}

function getSeedStampPin() {
  const env = getServerEnv();

  if (process.env.NODE_ENV === "production" && !env.LOYALTY_STAMP_PIN) {
    throw new Error("LOYALTY_STAMP_PIN is required to seed the shared stamp PIN.");
  }

  const generatedPin = env.LOYALTY_STAMP_PIN
    ? undefined
    : randomBytes(4).toString("hex");
  const pin = env.LOYALTY_STAMP_PIN ?? generatedPin;

  if (!pin) {
    throw new Error("LOYALTY_STAMP_PIN is required to seed the shared stamp PIN.");
  }

  return {
    pin,
    generatedPin,
  };
}

async function seed() {
  const { email, password, fullName, generatedPassword } = getSeedAdminConfig();
  const { pin, generatedPin } = getSeedStampPin();

  const passwordHash = hashSecret(password);
  const stampPinHash = hashSecret(pin);

  await getDb()
    .insert(adminAccounts)
    .values({
      email,
      passwordHash,
      fullName,
      role: "owner",
    })
    .onConflictDoUpdate({
      target: adminAccounts.email,
      set: {
        passwordHash,
        fullName,
        role: "owner",
        updatedAt: new Date(),
      },
    });

  console.log(`Seeded owner admin account: ${email}`);

  if (generatedPassword) {
    console.log(`Generated local admin password: ${generatedPassword}`);
  }

  await getDb()
    .insert(adminSettings)
    .values({
      key: LOYALTY_STAMP_PIN_KEY,
      valueHash: stampPinHash,
    })
    .onConflictDoUpdate({
      target: adminSettings.key,
      set: {
        valueHash: stampPinHash,
        updatedAt: new Date(),
      },
    });

  console.log("Seeded shared loyalty stamp PIN.");

  if (generatedPin) {
    console.log(`Generated local loyalty stamp PIN: ${generatedPin}`);
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
