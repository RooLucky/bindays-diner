import "server-only";

import { and, asc, eq } from "drizzle-orm";

import type { ChatbotMenuItem } from "@/lib/chatbot-contracts";
import { getDb } from "@/lib/db";
import {
  chatbotKnowledgeEntries,
  managementItems,
} from "@/lib/db/schema";
import {
  getManagementPayload,
  type ManagementCategorySlug,
} from "@/lib/management";

const MENU_KNOWLEDGE_LIMIT = 10;
const MENU_RECOMMENDATION_DEFAULT_LIMIT = 4;
const MENU_RECOMMENDATION_MAX_LIMIT = 6;

const menuKnowledgeConfig: Record<
  ManagementCategorySlug,
  {
    question: string;
    label: string;
    category: string;
    keywords: string;
    queryTerms: string[];
  }
> = {
  drinks: {
    question: "What drinks are currently available?",
    label: "drinks",
    category: "Live Menu - Drinks",
    keywords: "drink drinks beverage beverages refreshment refreshments coffee tea shake juice cold hot",
    queryTerms: ["drink", "drinks", "beverage", "coffee", "tea", "shake", "refreshment"],
  },
  "best-seller": {
    question: "What are Binday Diner's current best sellers?",
    label: "best sellers",
    category: "Live Menu - Best Seller",
    keywords: "best seller bestseller popular top selling recommended favorite favorites",
    queryTerms: ["best seller", "bestseller", "popular", "top selling", "recommended"],
  },
  "student-meal": {
    question: "What student meals are currently available?",
    label: "student meals",
    category: "Live Menu - Student Meals",
    keywords: "student meal student meals budget affordable school college discount",
    queryTerms: ["student", "budget meal", "affordable meal"],
  },
  promo: {
    question: "What promos are currently available?",
    label: "promos",
    category: "Live Menu - Promos",
    keywords: "promo promos promotion promotions offer offers deal deals discount bundle",
    queryTerms: ["promo", "promotion", "offer", "deal", "discount", "bundle"],
  },
  "meal-of-the-day": {
    question: "What is the current meal of the day?",
    label: "meals of the day",
    category: "Live Menu - Meal of the Day",
    keywords: "meal of the day daily meal today special today's special featured meal",
    queryTerms: ["meal of the day", "daily meal", "today special", "today's special"],
  },
  "main-dish": {
    question: "What main dishes are currently available?",
    label: "main dishes",
    category: "Live Menu - Main Dishes",
    keywords: "menu main dish main dishes food available dishes meals pasta pizza dessert",
    queryTerms: ["menu", "main dish", "food available", "dishes available"],
  },
};

const categorySlugs = Object.keys(menuKnowledgeConfig) as ManagementCategorySlug[];

const menuCategoryHrefs: Record<ManagementCategorySlug, string> = {
  drinks: "/drinks",
  "meal-of-the-day": "/meal-of-the-day",
  "best-seller": "/best-seller",
  promo: "/promos",
  "student-meal": "/student-meals",
  "main-dish": "/menu",
};

const menuCategoryPatterns: Array<{
  slug: ManagementCategorySlug;
  pattern: RegExp;
}> = [
  { slug: "drinks", pattern: /\b(drinks?|beverages?|refreshments?)\b/i },
  { slug: "student-meal", pattern: /\bstudent\s+(?:meals?|menu)\b/i },
  { slug: "promo", pattern: /\b(promos?|promotions?|deals?|offers?)\b/i },
  {
    slug: "meal-of-the-day",
    pattern: /\b(meal\s+of\s+the\s+day|daily\s+meal|today'?s\s+special)\b/i,
  },
  { slug: "best-seller", pattern: /\b(best[\s-]?sellers?|top[\s-]?sellers?)\b/i },
  { slug: "main-dish", pattern: /\b(main\s+(?:menu|dishes?)|food\s+menu|menu)\b/i },
];

const preferenceProfiles = [
  {
    label: "sweet options",
    pattern: /\b(sweets?|sweet\s+tooth|desserts?|cakes?|chocolates?|pastr(?:y|ies))\b/i,
    terms: [
      "sweet",
      "dessert",
      "cake",
      "chocolate",
      "pastry",
      "tiramisu",
      "cream",
      "creamy",
      "sugar",
    ],
  },
  {
    label: "coffee options",
    pattern: /\b(coffee|caffeine|caffeinated)\b/i,
    terms: ["coffee", "caffeine", "caffeinated", "espresso", "latte", "hot drink"],
  },
  {
    label: "refreshing options",
    pattern: /\b(refreshing|cold|iced|cooler)\b/i,
    terms: ["refreshing", "cold", "iced", "ice", "cooler", "shake", "juice"],
  },
] as const;

const numberWords: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
};

function getRequestedMenuLimit(message: string) {
  const match = message.match(
    /\b(?:top|best|recommend(?:ed|ations?)?|suggest(?:ed|ions?)?)\s+(\d+|one|two|three|four|five|six)\b/i,
  );

  if (!match?.[1]) {
    return MENU_RECOMMENDATION_DEFAULT_LIMIT;
  }

  const requested = /^\d+$/.test(match[1])
    ? Number(match[1])
    : numberWords[match[1].toLowerCase()];

  return Math.min(
    Math.max(requested ?? MENU_RECOMMENDATION_DEFAULT_LIMIT, 1),
    MENU_RECOMMENDATION_MAX_LIMIT,
  );
}

function getRequestedMenuCategory(message: string) {
  return menuCategoryPatterns.find(({ pattern }) => pattern.test(message))?.slug;
}

function getPreferenceProfile(message: string) {
  return preferenceProfiles.find(({ pattern }) => pattern.test(message));
}

function compact(value: string, maxLength = 180) {
  const normalized = value.replace(/\s+/g, " ").trim();

  return normalized.length <= maxLength
    ? normalized
    : `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

function buildAnswer(
  label: string,
  items: Array<{
    name: string;
    price: string;
    tag: string | null;
  }>,
) {
  if (items.length === 0) {
    return `There are no active ${label} currently listed. Please check the website again later for updates.`;
  }

  const lines = items.map((item, index) => {
    const tag = item.tag ? ` [${compact(item.tag, 15)}]` : "";

    return `${index + 1}. ${compact(item.name, 55)} - ${compact(item.price, 15)}${tag}`;
  });

  return `Current ${label}, based on the active website menu:\n${lines.join("\n")}`;
}

export async function syncChatbotMenuKnowledgeForCategory(
  slug: ManagementCategorySlug,
) {
  const config = menuKnowledgeConfig[slug];
  const db = getDb();
  const items = await db
    .select({
      name: managementItems.name,
      price: managementItems.price,
      tag: managementItems.tag,
    })
    .from(managementItems)
    .where(
      and(
        eq(managementItems.categorySlug, slug),
        eq(managementItems.isActive, true),
      ),
    )
    .orderBy(asc(managementItems.sortOrder), asc(managementItems.createdAt))
    .limit(MENU_KNOWLEDGE_LIMIT);
  const answer = buildAnswer(config.label, items);
  const itemKeywords = items
    .flatMap((item) => [item.name, item.tag ?? ""])
    .join(" ");
  const keywords = compact(`${config.keywords} ${itemKeywords}`, 600);
  const now = new Date();
  const [entry] = await db
    .insert(chatbotKnowledgeEntries)
    .values({
      question: config.question,
      answer,
      keywords,
      category: config.category,
      isActive: true,
      isFeatured: false,
    })
    .onConflictDoUpdate({
      target: chatbotKnowledgeEntries.question,
      set: {
        answer,
        keywords,
        category: config.category,
        updatedAt: now,
      },
    })
    .returning();

  return entry;
}

export async function syncAllChatbotMenuKnowledge() {
  return Promise.all(categorySlugs.map(syncChatbotMenuKnowledgeForCategory));
}

export async function syncChatbotMenuKnowledgeForQuery(query: string) {
  const normalized = query.toLowerCase().replace(/\s+/g, " ");
  const matchingSlugs = categorySlugs.filter((slug) =>
    menuKnowledgeConfig[slug].queryTerms.some((term) => normalized.includes(term)),
  );

  if (matchingSlugs.length === 0) {
    return [];
  }

  return Promise.all(matchingSlugs.map(syncChatbotMenuKnowledgeForCategory));
}

function getKnowledgeCategorySlug(category: string) {
  return categorySlugs.find(
    (slug) => menuKnowledgeConfig[slug].category === category,
  );
}

function getItemMatchScore(
  query: string,
  item: { name: string; description: string; tag: string | null },
) {
  const queryTokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
  const searchable = `${item.name} ${item.description} ${item.tag ?? ""}`.toLowerCase();

  return queryTokens.reduce(
    (score, token) => score + (searchable.includes(token) ? 1 : 0),
    0,
  );
}

function getPreferenceMatchScore(
  terms: readonly string[],
  item: { name: string; description: string; tag: string | null },
) {
  const searchable = `${item.name} ${item.description} ${item.tag ?? ""}`.toLowerCase();

  return terms.reduce(
    (score, term) => score + (searchable.includes(term) ? 3 : 0),
    0,
  );
}

export type ChatbotMenuRecommendation = {
  answer: string;
  menuItems: ChatbotMenuItem[];
};

export async function resolveChatbotMenuRecommendation(
  message: string,
): Promise<ChatbotMenuRecommendation | null> {
  const requestedCategory = getRequestedMenuCategory(message);
  const preference = getPreferenceProfile(message);

  if (!requestedCategory && !preference) {
    return null;
  }

  const slugs = requestedCategory ? [requestedCategory] : categorySlugs;
  const payloads = await Promise.all(slugs.map(getManagementPayload));
  const candidates = payloads.flatMap((payload) =>
    payload.items
      .filter((item) => item.isActive)
      .map((item) => ({
        item,
        href: menuCategoryHrefs[payload.category.slug],
        score:
          getItemMatchScore(message, item) +
          (preference ? getPreferenceMatchScore(preference.terms, item) : 0),
      })),
  );
  const ranked = candidates
    .filter((candidate) => requestedCategory || candidate.score > 0)
    .sort(
      (left, right) =>
        right.score - left.score || left.item.sortOrder - right.item.sortOrder,
    );
  const unique = ranked.filter(
    (candidate, index, all) =>
      all.findIndex(
        (other) =>
          other.item.name.trim().toLowerCase() ===
          candidate.item.name.trim().toLowerCase(),
      ) === index,
  );
  const selected = unique.slice(0, getRequestedMenuLimit(message));
  const categoryLabel = requestedCategory
    ? menuKnowledgeConfig[requestedCategory].label
    : preference?.label ?? "menu options";

  if (selected.length === 0) {
    return {
      answer: `There are no active ${categoryLabel} matching that request right now. Please check the website again later for updates.`,
      menuItems: [],
    };
  }

  const isRecommendation =
    /\b(best|top|recommend|recommended|recommendation|suggest|suggestion|favorite)\b/i.test(
      message,
    ) || Boolean(preference);
  const heading = isRecommendation
    ? `Top ${selected.length} recommended ${categoryLabel}, based on the active website menu:`
    : `Current ${categoryLabel}, based on the active website menu:`;
  const lines = selected.map(({ item }, index) => {
    const tag = item.tag ? ` [${compact(item.tag, 15)}]` : "";

    return `${index + 1}. ${compact(item.name, 55)} - ${compact(item.price, 15)}${tag}`;
  });

  return {
    answer: `${heading}\n${lines.join("\n")}`,
    menuItems: selected.map(({ item, href }) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      imageAlt: item.imageAlt,
      categorySlug: item.categorySlug,
      href,
    })),
  };
}

export async function getChatbotMenuItemsForKnowledge(
  message: string,
  entries: Array<{ category: string }>,
  limit = 4,
): Promise<ChatbotMenuItem[]> {
  const slugs = Array.from(
    new Set(
      entries
        .map((entry) => getKnowledgeCategorySlug(entry.category))
        .filter((slug): slug is ManagementCategorySlug => Boolean(slug)),
    ),
  );

  if (slugs.length === 0) {
    return [];
  }

  const payloads = await Promise.all(slugs.map(getManagementPayload));

  return payloads
    .flatMap((payload) =>
      payload.items
        .filter((item) => item.isActive)
        .map((item) => ({
          item,
          score: getItemMatchScore(message, item),
          href: menuCategoryHrefs[payload.category.slug],
        })),
    )
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ item, href }) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      imageAlt: item.imageAlt,
      categorySlug: item.categorySlug,
      href,
    }));
}

export async function trySyncChatbotMenuKnowledgeForCategory(
  slug: ManagementCategorySlug,
) {
  try {
    await syncChatbotMenuKnowledgeForCategory(slug);
    return true;
  } catch (error) {
    console.warn(`Unable to refresh chatbot menu knowledge for ${slug}.`, error);
    return false;
  }
}
