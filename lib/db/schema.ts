import {
  boolean,
  index,
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

export const customerReviewStatus = pgEnum("customer_review_status", [
  "draft",
  "approved",
  "rejected",
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

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminAccountId: uuid("admin_account_id")
      .notNull()
      .references(() => adminAccounts.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("admin_sessions_token_hash_idx").on(table.tokenHash)],
);

export const managementCategories = pgTable(
  "management_categories",
  {
    slug: varchar("slug", { length: 80 }).primaryKey(),
    eyebrow: varchar("eyebrow", { length: 120 }).notNull(),
    title: varchar("title", { length: 220 }).notNull(),
    description: text("description").notNull(),
    ctaLabel: varchar("cta_label", { length: 120 }).notNull(),
    ctaHref: varchar("cta_href", { length: 220 }).notNull(),
    heroImageKey: text("hero_image_key"),
    heroImageUrl: text("hero_image_url").notNull(),
    heroAlt: varchar("hero_alt", { length: 220 }).notNull(),
    badge: varchar("badge", { length: 80 }),
    isHeaderActive: boolean("is_header_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
);

export const managementItems = pgTable(
  "management_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categorySlug: varchar("category_slug", { length: 80 })
      .notNull()
      .references(() => managementCategories.slug, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description").notNull(),
    price: varchar("price", { length: 40 }).notNull(),
    tag: varchar("tag", { length: 80 }),
    imageKey: text("image_key"),
    imageUrl: text("image_url").notNull(),
    imageAlt: varchar("image_alt", { length: 220 }).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("management_items_category_name_idx").on(
      table.categorySlug,
      table.name,
    ),
  ],
);

export const managementItemCategories = pgTable(
  "management_item_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 80 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("management_item_categories_name_idx").on(table.name)],
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
    uniqueIndex("loyalty_members_name_birthday_idx").on(
      table.normalizedName,
      table.birthday,
    ),
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

export const chatbotKnowledgeEntries = pgTable(
  "chatbot_knowledge_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    question: varchar("question", { length: 240 }).notNull(),
    answer: text("answer").notNull(),
    keywords: text("keywords").default("").notNull(),
    category: varchar("category", { length: 80 }).default("General").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("chatbot_knowledge_question_idx").on(table.question),
    index("chatbot_knowledge_active_idx").on(table.isActive),
  ],
);

export const chatbotRateLimits = pgTable("chatbot_rate_limits", {
  keyHash: varchar("key_hash", { length: 64 }).primaryKey(),
  requestCount: integer("request_count").default(0).notNull(),
  windowStartedAt: timestamp("window_started_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const customerReviews = pgTable(
  "customer_reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: varchar("full_name", { length: 160 }).notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment").notNull(),
    favoriteItem: varchar("favorite_item", { length: 120 }),
    status: customerReviewStatus("status").default("draft").notNull(),
    isApproved: boolean("is_approved").default(false).notNull(),
    imageKeysJson: text("image_keys_json").default("[]").notNull(),
    imageUrlsJson: text("image_urls_json").default("[]").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("customer_reviews_approved_created_idx").on(
      table.isApproved,
      table.createdAt,
    ),
  ],
);

export const googleReviewCache = pgTable("google_review_cache", {
  placeId: varchar("place_id", { length: 160 }).primaryKey(),
  rating: varchar("rating", { length: 16 }),
  userRatingCount: integer("user_rating_count"),
  googleMapsUrl: text("google_maps_url"),
  reviewsJson: text("reviews_json").default("[]").notNull(),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
