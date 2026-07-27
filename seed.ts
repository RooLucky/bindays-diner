import "dotenv/config";

import { randomBytes } from "node:crypto";

import { LOYALTY_STAMP_PIN_KEY } from "@/lib/admin-settings";
import { DEFAULT_CHATBOT_KNOWLEDGE } from "@/lib/chatbot/default-knowledge";
import { getDb } from "@/lib/db";
import {
  adminAccounts,
  adminSettings,
  chatbotKnowledgeEntries,
  managementCategories,
  managementItemCategories,
  managementItems,
} from "@/lib/db/schema";
import { getServerEnv } from "@/lib/env";
import {
  MANAGEMENT_CATEGORIES,
  getStaticManagementItemCategoryNames,
  getStaticManagementCategory,
  getStaticManagementItems,
} from "@/lib/management";
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
    : `bindaysdiner**`;
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

  for (const slug of MANAGEMENT_CATEGORIES) {
    const category = getStaticManagementCategory(slug);
    const items = getStaticManagementItems(slug);

    await getDb()
      .insert(managementCategories)
      .values({
        ...category,
        heroImageUrl: category.heroImageUrl,
      })
      .onConflictDoUpdate({
        target: managementCategories.slug,
        set: {
          eyebrow: category.eyebrow,
          title: category.title,
          description: category.description,
          ctaLabel: category.ctaLabel,
          ctaHref: category.ctaHref,
          heroImageKey: category.heroImageKey,
          heroImageUrl: category.heroImageUrl,
          heroAlt: category.heroAlt,
          badge: category.badge,
          updatedAt: new Date(),
        },
      });

    for (const item of items) {
      await getDb()
        .insert(managementItems)
        .values(item)
        .onConflictDoUpdate({
          target: [managementItems.categorySlug, managementItems.name],
          set: {
            description: item.description,
            price: item.price,
            tag: item.tag,
            imageKey: item.imageKey,
            imageUrl: item.imageUrl,
            imageAlt: item.imageAlt,
            sortOrder: item.sortOrder,
            isActive: item.isActive,
            updatedAt: new Date(),
          },
        });
    }

    console.log(
      `Seeded management category "${slug}" with ${items.length} items: ${items
        .map((item) => `${item.name} [${item.imageUrl}]`)
        .join(", ")}`,
    );
  }

  console.log("Seeded management categories and items.");

  for (const name of getStaticManagementItemCategoryNames()) {
    await getDb()
      .insert(managementItemCategories)
      .values({ name })
      .onConflictDoUpdate({
        target: managementItemCategories.name,
        set: {
          name,
          updatedAt: new Date(),
        },
      });
  }

  console.log("Seeded management item category options.");

  await getDb()
    .insert(chatbotKnowledgeEntries)
    .values(
      DEFAULT_CHATBOT_KNOWLEDGE.map((entry) => ({
        ...entry,
        isActive: true,
      })),
    )
    .onConflictDoNothing({ target: chatbotKnowledgeEntries.question });

  console.log("Seeded chatbot knowledge entries.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
