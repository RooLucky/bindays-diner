import {
  ShoppingBag,
  Bot,
  Coffee,
  CookingPot,
  Gift,
  GraduationCap,
  LayoutDashboard,
  ListTree,
  Megaphone,
  MessageSquare,
  Navigation,
  Plus,
  Soup,
  Star,
  Utensils,
} from "lucide-react";

export const adminOverview = {
  label: "Overview",
  href: "/management",
  icon: LayoutDashboard,
};

export const adminTopNavigation = [
  adminOverview,
  { label: "Categories", href: "/management/categories", icon: ListTree },
  { label: "Orders", href: "/management/orders", icon: ShoppingBag },
];

export const adminNavigation = [
  {
    label: "Menu catalog",
    items: [
      { label: "Main dishes", href: "/management/main-dish", icon: Utensils },
      {
        label: "Student meals",
        href: "/management/student-meal",
        icon: GraduationCap,
      },
      {
        label: "Bilao trays",
        href: "/management/bilao-tray",
        icon: CookingPot,
      },
      { label: "Add-ons", href: "/management/add-ons", icon: Plus },
      { label: "Drinks", href: "/management/drinks", icon: Coffee },
    ],
  },
  {
    label: "Featured menus",
    items: [
      {
        label: "Meal of the day",
        href: "/management/meal-of-the-day",
        icon: Soup,
      },
      { label: "Best sellers", href: "/management/best-seller", icon: Star },
      { label: "Promotions", href: "/management/promo", icon: Megaphone },
    ],
  },
  {
    label: "Customer experience",
    items: [
      { label: "Loyalty program", href: "/management/loyalty", icon: Gift },
      { label: "Reviews", href: "/management/reviews", icon: MessageSquare },
    ],
  },
  {
    label: "Website settings",
    items: [
      {
        label: "Header navigation",
        href: "/management/header-navigation",
        icon: Navigation,
      },
      {
        label: "Chatbot knowledge",
        href: "/management/chatbot-knowledge",
        icon: Bot,
      },
    ],
  },
];

export function getAdminPage(pathname: string) {
  const topItem = adminTopNavigation.find((item) => item.href === pathname);
  if (topItem) return { ...topItem, group: "Workspace" };
  if (pathname.startsWith("/admin/loyalty/scan/"))
    return {
      label: "Loyalty card",
      href: pathname,
      icon: Gift,
      group: "Customer experience",
    };
  for (const group of adminNavigation) {
    const item = group.items.find((item) => item.href === pathname);
    if (item) return { ...item, group: group.label };
  }
  return { ...adminOverview, group: "Workspace" };
}
