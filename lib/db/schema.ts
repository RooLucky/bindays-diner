import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const loyaltyStampSource = pgEnum("loyalty_stamp_source", [
  "online",
  "physical",
  "manual",
]);

export const loyaltyRedemptionSource = pgEnum("loyalty_redemption_source", [
  "admin",
  "system",
]);

export const adminAccountRole = pgEnum("admin_account_role", [
  "owner",
  "admin",
]);

export const adminAccounts = pgTable(
  "admin_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    role: adminAccountRole("role").default("admin").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("admin_accounts_email_idx").on(table.email)],
);

export const adminSettings = pgTable(
  "admin_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: varchar("key", { length: 120 }).notNull(),
    valueHash: text("value_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("admin_settings_key_idx").on(table.key)],
);

export const loyaltyMembers = pgTable(
  "loyalty_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    memberCode: varchar("member_code", { length: 32 }).notNull(),
    qrToken: varchar("qr_token", { length: 64 }).notNull(),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    normalizedName: varchar("normalized_name", { length: 160 }).notNull(),
    birthday: varchar("birthday", { length: 10 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    normalizedPhone: varchar("normalized_phone", { length: 40 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("loyalty_members_member_code_idx").on(table.memberCode),
    uniqueIndex("loyalty_members_qr_token_idx").on(table.qrToken),
    uniqueIndex("loyalty_members_phone_idx").on(table.normalizedPhone),
  ],
);

export const loyaltyStamps = pgTable(
  "loyalty_stamps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => loyaltyMembers.id, { onDelete: "cascade" }),
    rewardCycle: integer("reward_cycle").default(1).notNull(),
    stampNumber: integer("stamp_number").notNull(),
    source: loyaltyStampSource("source").default("physical").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("loyalty_stamps_member_cycle_number_idx").on(
      table.memberId,
      table.rewardCycle,
      table.stampNumber,
    ),
  ],
);

export const loyaltyRedemptions = pgTable("loyalty_redemptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => loyaltyMembers.id, { onDelete: "cascade" }),
  rewardCycle: integer("reward_cycle").default(1).notNull(),
  source: loyaltyRedemptionSource("source").default("admin").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
