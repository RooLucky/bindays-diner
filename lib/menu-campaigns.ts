import type { LucideIcon } from "lucide-react";
import {
  BadgePercent,
  CalendarHeart,
  ChefHat,
  Clock,
  Coffee,
  CupSoda,
  Gift,
  GlassWater,
  Heart,
  Leaf,
  MapPin,
  Medal,
  PackageCheck,
  Sparkles,
  Star,
  Snowflake,
  Trophy,
  Users,
  WalletCards,
} from "lucide-react";

export type Dish = {
  name: string;
  description: string;
  price: string;
  image: string;
  tag?: string;
};

export type CampaignFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type Campaign = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  heroImage: string;
  heroAlt: string;
  badge?: string;
  dishes: Dish[];
  features: CampaignFeature[];
};

const images = {
  pasta: "/images/menu-spaghetti.png",
  pizza: "/images/menu-pizza.png",
  dessert: "/images/menu-tiramisu.png",
  hero: "/images/hero-pasta.png",
};

export const menuDishes: Dish[] = [
  {
    name: "Spaghetti Pomodoro",
    description: "Classic spaghetti with fresh tomato sauce, garlic, and basil.",
    price: "P180",
    image: images.pasta,
    tag: "Pasta",
  },
  {
    name: "Margherita Pizza",
    description: "Fresh tomatoes, mozzarella, basil, and our homemade sauce.",
    price: "P220",
    image: images.pizza,
    tag: "Pizza",
  },
  {
    name: "Fettuccine Alfredo",
    description: "Creamy parmesan sauce with handmade fettuccine pasta.",
    price: "P190",
    image: images.hero,
    tag: "Pasta",
  },
  {
    name: "Lasagna Classica",
    description: "Layers of pasta, beef ragu, bechamel sauce, and cheese.",
    price: "P225",
    image: images.dessert,
    tag: "Main Course",
  },
  {
    name: "Chicken Parmesan",
    description: "Crispy chicken cutlet with marinara sauce and melted cheese.",
    price: "P210",
    image: images.pizza,
    tag: "Main Course",
  },
  {
    name: "Tiramisu",
    description: "Coffee-soaked ladyfingers with mascarpone cream.",
    price: "P95",
    image: images.dessert,
    tag: "Dessert",
  },
];

export const campaigns: Record<string, Campaign> = {
  "add-ons": {
    slug: "add-ons",
    eyebrow: "Complete Your Meal",
    title: "A Little Extra on the Side",
    description:
      "Round out your order with easy extras, savory sides, and filling additions made to pair with any meal.",
    ctaLabel: "Choose Add-ons",
    ctaHref: "#add-ons",
    heroImage: "/images/fries.png",
    heroAlt: "Crispy fries served as a meal add-on",
    badge: "Starts at P25",
    dishes: [
      {
        name: "Extra Rice",
        description: "An extra serving of warm steamed rice for a more filling meal.",
        price: "P25",
        image: "/images/multi.png",
        tag: "Rice",
      },
      {
        name: "French Fries",
        description: "Golden, crispy fries served hot and lightly seasoned.",
        price: "P49",
        image: "/images/fries.png",
        tag: "Side Dish",
      },
      {
        name: "Fried Rice",
        description: "Flavorful fried rice for upgrading your regular rice serving.",
        price: "P45",
        image: "/images/friedrice.png",
        tag: "Rice",
      },
      {
        name: "Pancit Side",
        description: "A smaller serving of savory pancit to share or add to your plate.",
        price: "P49",
        image: "/images/pancit.png",
        tag: "Noodles",
      },
    ],
    features: [
      {
        icon: PackageCheck,
        title: "Easy Additions",
        description: "Simple extras that fit naturally into any food order.",
      },
      {
        icon: WalletCards,
        title: "Budget Friendly",
        description: "Small upgrades at prices that are easy to add on.",
      },
      {
        icon: ChefHat,
        title: "Made Fresh",
        description: "Sides prepared with the same care as every main dish.",
      },
      {
        icon: Sparkles,
        title: "More to Enjoy",
        description: "Extra flavor and variety whenever your meal needs it.",
      },
    ],
  },
  "main-dish": {
    slug: "main-dish",
    eyebrow: "Paboritong Pinoy",
    title: "Mga Paborito sa Hapag",
    description:
      "Familiar Filipino flavors, generous servings, and comforting dishes made for everyday cravings and salu-salo moments.",
    ctaLabel: "Choose Your Meals",
    ctaHref: "#menu-dishes",
    heroImage: images.hero,
    heroAlt: "Featured pasta dish from the Bindays Diner menu",
    badge: "Lutong Bahay",
    dishes: menuDishes,
    features: [
      {
        icon: Leaf,
        title: "Fresh Ingredients",
        description: "Quality ingredients selected for every plate.",
      },
      {
        icon: ChefHat,
        title: "Kitchen Crafted",
        description: "Prepared with care by the Bindays Diner team.",
      },
      {
        icon: Heart,
        title: "Made for Sharing",
        description: "Comforting favorites for friends and family.",
      },
      {
        icon: Clock,
        title: "Cooked to Order",
        description: "Your dishes are prepared when you order.",
      },
    ],
  },
  drinks: {
    slug: "drinks",
    eyebrow: "Cool and Comforting",
    title: "Drinks for Every Craving",
    description:
      "Refreshing local favorites, tropical coolers, and warm cups made to complete every meal.",
    ctaLabel: "Choose Your Drinks",
    ctaHref: "#drinks",
    heroImage: "/images/drink-calamansi-tea.png",
    heroAlt: "Calamansi iced tea with fresh citrus and mint",
    badge: "Starts at P39",
    dishes: [
      {
        name: "Calamansi Iced Tea",
        description: "Fresh calamansi, brewed tea, mint, and plenty of ice.",
        price: "P39",
        image: "/images/drink-calamansi-tea.png",
        tag: "Cold Drink",
      },
      {
        name: "Sago at Gulaman",
        description: "A classic local cooler with sago pearls and soft gulaman.",
        price: "P49",
        image: "/images/drink-sago-gulaman.png",
        tag: "Local Favorite",
      },
      {
        name: "Mango Shake",
        description: "Creamy ripe mango blended smooth and served ice-cold.",
        price: "P69",
        image: "/images/drink-mango-shake.png",
        tag: "Fruit Shake",
      },
      {
        name: "Native Coffee",
        description: "Freshly brewed local coffee with a rich, comforting finish.",
        price: "P45",
        image: "/images/drink-native-coffee.png",
        tag: "Hot Drink",
      },
    ],
    features: [
      {
        icon: CupSoda,
        title: "Made to Order",
        description: "Prepared fresh when you place your food order.",
      },
      {
        icon: Snowflake,
        title: "Served Refreshing",
        description: "Cold favorites poured and blended for every visit.",
      },
      {
        icon: Coffee,
        title: "Warm Choices",
        description: "Comforting hot drinks for slow meals and conversations.",
      },
      {
        icon: GlassWater,
        title: "Meal Pairings",
        description: "Easy drink choices to complete any dish or bundle.",
      },
    ],
  },
  "student-meals": {
    slug: "student-meals",
    eyebrow: "Budget Friendly",
    title: "Student Meals Sulit. Sarap. Busog.",
    description:
      "Affordable, filling meals made for everyday cravings and student budgets.",
    ctaLabel: "Reserve Student Meals",
    ctaHref: "/reservations",
    heroImage: images.hero,
    heroAlt: "Student meal plates with rice, pasta, and warm sides",
    badge: "Starts at P49",
    dishes: [
      {
        name: "Siomai Rice",
        description: "Steamed siomai with rice and house sauce.",
        price: "P49",
        image: images.hero,
        tag: "Student Meal",
      },
      {
        name: "Chicken Tocino",
        description: "Sweet and savory chicken tocino with garlic rice.",
        price: "P59",
        image: images.pizza,
        tag: "Student Meal",
      },
      {
        name: "Burger Steak",
        description: "Juicy burger steak with mushroom gravy and rice.",
        price: "P59",
        image: images.dessert,
        tag: "Student Meal",
      },
      {
        name: "Pancit Canton",
        description: "Stir-fried noodles with veggies and meat.",
        price: "P49",
        image: images.pasta,
        tag: "Student Meal",
      },
    ],
    features: [
      {
        icon: WalletCards,
        title: "Affordable Prices",
        description: "Great meals that will not break your budget.",
      },
      {
        icon: PackageCheck,
        title: "Big Portions",
        description: "Filling meals perfect for students on the go.",
      },
      {
        icon: Clock,
        title: "Quick Service",
        description: "Fast and convenient for your busy schedule.",
      },
      {
        icon: Users,
        title: "Student Friendly",
        description: "Made with students in mind.",
      },
    ],
  },
  promos: {
    slug: "promos",
    eyebrow: "Limited Offers",
    title: "Promos Made for Sharing",
    description:
      "Bundle deals and seasonal offers designed to bring more people to the table.",
    ctaLabel: "Book a Promo Table",
    ctaHref: "/reservations",
    heroImage: images.pizza,
    heroAlt: "Pizza and pasta promo spread for groups",
    badge: "Save More",
    dishes: [
      {
        name: "Barkada Pasta Set",
        description: "Two pasta trays and drinks for a casual group meal.",
        price: "P399",
        image: images.pasta,
        tag: "Bundle",
      },
      {
        name: "Pizza Duo Deal",
        description: "Two pizzas with house iced tea for sharing.",
        price: "P420",
        image: images.pizza,
        tag: "Promo",
      },
      {
        name: "Date Night Plate",
        description: "Pasta, dessert, and two drinks for two.",
        price: "P349",
        image: images.dessert,
        tag: "Promo",
      },
    ],
    features: [
      {
        icon: BadgePercent,
        title: "Weekly Deals",
        description: "Fresh offers to keep customers coming back.",
      },
      {
        icon: Users,
        title: "Group Friendly",
        description: "Bundles made for classmates, friends, and families.",
      },
      {
        icon: Gift,
        title: "Reward Moments",
        description: "Perfect for celebrations without overspending.",
      },
      {
        icon: CalendarHeart,
        title: "Seasonal Specials",
        description: "Flexible promos for holidays and events.",
      },
    ],
  },
  "meal-of-the-day": {
    slug: "meal-of-the-day",
    eyebrow: "Today Only",
    title: "Meal of the Day",
    description:
      "A featured dish selected daily to give customers one clear reason to visit today.",
    ctaLabel: "Reserve Today's Meal",
    ctaHref: "/reservations",
    heroImage: images.hero,
    heroAlt: "Daily featured pasta plate",
    badge: "Chef Pick",
    dishes: [
      {
        name: "Creamy Chicken Pasta",
        description: "Rich cream sauce, tender chicken, herbs, and parmesan.",
        price: "P149",
        image: images.hero,
        tag: "Today",
      },
      {
        name: "Pomodoro Lunch Plate",
        description: "Tomato pasta served with garlic bread and iced tea.",
        price: "P129",
        image: images.pasta,
        tag: "Lunch",
      },
      {
        name: "Pizza Slice Combo",
        description: "Fresh pizza slice, side salad, and house drink.",
        price: "P119",
        image: images.pizza,
        tag: "Combo",
      },
    ],
    features: [
      {
        icon: ChefHat,
        title: "Chef Selected",
        description: "A fresh pick chosen for the day.",
      },
      {
        icon: Clock,
        title: "Limited Time",
        description: "Designed to create urgency and daily visits.",
      },
      {
        icon: Sparkles,
        title: "Freshly Prepared",
        description: "Made with the same house quality.",
      },
      {
        icon: Heart,
        title: "Comfort Favorite",
        description: "Easy to love and easy to recommend.",
      },
    ],
  },
  "best-seller": {
    slug: "best-seller",
    eyebrow: "Customer Favorites",
    title: "Best Seller Plates",
    description:
      "The dishes customers ask for again and again, featured to help new guests decide fast.",
    ctaLabel: "Reserve Best Sellers",
    ctaHref: "/reservations",
    heroImage: images.pasta,
    heroAlt: "Best-selling pasta dish",
    badge: "Most Loved",
    dishes: [
      {
        name: "Spaghetti Pomodoro",
        description: "Classic house pasta with fresh tomato sauce and basil.",
        price: "P180",
        image: images.pasta,
        tag: "Best Seller",
      },
      {
        name: "Margherita Pizza",
        description: "Fresh mozzarella, tomato, basil, and house sauce.",
        price: "P220",
        image: images.pizza,
        tag: "Best Seller",
      },
      {
        name: "Tiramisu",
        description: "Creamy coffee dessert with mascarpone.",
        price: "P95",
        image: images.dessert,
        tag: "Dessert",
      },
    ],
    features: [
      {
        icon: Trophy,
        title: "Top Rated",
        description: "The easiest picks for first-time customers.",
      },
      {
        icon: Star,
        title: "Guest Favorites",
        description: "Reliable dishes people return for.",
      },
      {
        icon: Medal,
        title: "Signature Taste",
        description: "A strong showcase of the kitchen.",
      },
      {
        icon: Leaf,
        title: "Fresh Ingredients",
        description: "Prepared with our house standards.",
      },
    ],
  },
  "bilao-tray": {
    slug: "bilao-tray",
    eyebrow: "Made for Sharing",
    title: "Bilao Trays",
    description:
      "Generous Filipino favorites prepared in shareable bilao trays for family meals, gatherings, and celebrations.",
    ctaLabel: "Inquire About Bilao Trays",
    ctaHref: "/reservations",
    heroImage: images.hero,
    heroAlt: "A generous Filipino meal prepared for sharing",
    badge: "For Sharing",
    dishes: [],
    features: [
      {
        icon: Users,
        title: "Made for the Group",
        description: "Shareable portions for family meals, teams, and celebrations.",
      },
      {
        icon: PackageCheck,
        title: "Prepared with Care",
        description: "Every tray is packed with the same care as every meal we serve.",
      },
      {
        icon: CalendarHeart,
        title: "Gathering Ready",
        description: "A convenient choice for birthdays, meetings, and special occasions.",
      },
      {
        icon: Heart,
        title: "Filipino Favorites",
        description: "Comforting dishes that make sharing feel like home.",
      },
    ],
  },
};

export const allCampaigns = Object.values(campaigns);
