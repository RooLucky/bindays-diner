export type MainMenuSeedItem = {
  name: string;
  description: string;
  price: string;
  image: string;
  tag: string;
};

function menuImage(section: string, filename: string) {
  return ["", "Main Menu", section, filename]
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function item(
  name: string,
  description: string,
  price: string,
  section: string,
  filename: string,
  tag: string,
): MainMenuSeedItem {
  return {
    name,
    description,
    price,
    image: menuImage(section, filename),
    tag,
  };
}

const mainDishItems: MainMenuSeedItem[] = [
  item("Goto Plain", "Warm Filipino rice porridge served simply for a comforting meal.", "P59", "GOTO", "Goto Plain - Php 59.00.jpg", "Goto"),
  item("Goto with Egg", "Filipino rice porridge topped with a boiled egg.", "P69", "GOTO", "Goto with Egg - Php 69.00.jpg", "Goto"),
  item("Goto with Egg + Tokwa", "Warm rice porridge served with egg and fried tofu.", "P79", "GOTO", "Goto with Egg + Tokwa - Php 79.00.jpg", "Goto"),
  item("Goto Special", "A fuller serving of goto with savory meat and toppings.", "P129", "GOTO", "Goto Special - Php 129.00.jpg", "Goto"),
  item("Goto Lechon Kawali", "Filipino rice porridge served with crispy pork belly.", "P139", "GOTO", "Goto Lechon Kawali - Php 139.jpg", "Goto"),
  item("Goto Beef Pares", "Warm goto paired with sweet and savory braised beef.", "P149", "GOTO", "Goto Beef Pares - Php 149.00.jpg", "Goto"),
  item("Goto Overload", "A generous bowl of goto with assorted meat and toppings.", "P189", "GOTO", "Goto Overload - Php 189.00.jpg", "Goto"),

  item("Beef Mami Ordinary", "Warm noodle soup with tender beef and vegetables.", "P129", "MAMI", "Beef Mami Ordinary - Php 129.00.jpg", "Mami"),
  item("Beef Mami Special", "Beef noodle soup with a fuller serving of meat and toppings.", "P159", "MAMI", "Beef Mami Special - Php 159.00.jpg", "Mami"),
  item("Beef Mami Overload", "A hearty beef noodle soup with extra meat and toppings.", "P209", "MAMI", "Beef Mami Overload - Php 209.00.jpg", "Mami"),
  item("Chicken Mami Ordinary", "Warm noodle soup with chicken and vegetables.", "P119", "MAMI", "Chicken Mami Ordinary - Php 119.00.jpg", "Mami"),
  item("Chicken Mami Special", "Chicken noodle soup with a fuller serving of toppings.", "P149", "MAMI", "Chicken Mami Special - Php 149.00.jpg", "Mami"),
  item("Chicken Mami Overload", "A hearty chicken noodle soup with extra meat and toppings.", "P179", "MAMI", "Chicken Mami Overload - Php 179.00.jpg", "Mami"),
  item("Kinalas Ordinary", "Bicol-style noodle soup with tender meat and savory gravy.", "P119", "MAMI", "Kinalas Ordinary - Php 119.00.jpg", "Kinalas"),
  item("Kinalas Special", "Bicol-style noodles with extra meat, gravy, and toppings.", "P149", "MAMI", "Kinalas Special - Php 149.00.jpg", "Kinalas"),
  item("Kinalas Overload", "A generous bowl of Bicol-style noodles with assorted toppings.", "P199", "MAMI", "Kinalas Overload - Php 199.00.jpg", "Kinalas"),

  item("Beef Pares Meal", "Sweet and savory braised beef served as a filling rice meal.", "P139", "PARES MEALS", "Beef Pares Meal - Php 139.00.jpg", "Pares Meal"),
  item("Beef Pares + Lechon Kawali", "Braised beef pares served with crispy pork belly and rice.", "P169", "PARES MEALS", "Beef Pares+Lechon Kawali - Php 169.00.jpg", "Pares Meal"),
  item("Chicharon Bulaklak + Pares", "Braised beef pares paired with crispy chicharon bulaklak.", "P169", "PARES MEALS", "Chicharon Bulaklak+Pares - 169.00.jpg", "Pares Meal"),

  item("Buttered Chicken Platter", "Buttered chicken pieces served on a platter for sharing.", "P229", "PLATTER", "Buttered Chicken Platter - Php 229.00.jpg", "Platter"),
  item("Chicharon Bulaklak Platter", "Crispy chicharon bulaklak served as a sharing platter.", "P239", "PLATTER", "Chicharon Bulaklak Platter - Php 239.00.jpg", "Platter"),
  item("Lechon Kawali Platter", "Crispy pork belly pieces served on a platter for sharing.", "P239", "PLATTER", "Lechon Kawali Platter - Php 239.00.jpg", "Platter"),
  item("Lumpia Platter (12 pcs)", "Twelve crisp fried spring rolls served with dipping sauce.", "P99", "PLATTER", "Lumpia Platter (12pcs) - Php 99.00.jpg", "Platter"),
  item("Sisig Platter", "Savory chopped pork sisig served on a platter for sharing.", "P239", "PLATTER", "Sisig Platter - Php 239.00.jpg", "Platter"),

  item("Binday's Overload", "A generous silog plate with assorted house meats, garlic rice, and egg.", "P229", "SILOG MEALS", "Binday_s Overload - Php 229.00.jpg", "Silog Meal"),
  item("Bulaksilog", "Crispy chicharon bulaklak served with garlic rice and egg.", "P159", "SILOG MEALS", "Bulaksilog - Php 159.00.jpg", "Silog Meal"),
  item("Chicksilog", "Seasoned chicken served with garlic rice and egg.", "P139", "SILOG MEALS", "Chicksilog - Php 139.00.jpg", "Silog Meal"),
  item("Cornsilog", "Savory corned beef served with garlic rice and egg.", "P149", "SILOG MEALS", "Cornsilog - Php 149.00.jpg", "Silog Meal"),
  item("Hotsilog", "Filipino-style hotdog served with garlic rice and egg.", "P99", "SILOG MEALS", "Hotsilog - Php 99.00.jpg", "Silog Meal"),
  item("Kawali Silog", "Crispy lechon kawali served with garlic rice and egg.", "P159", "SILOG MEALS", "Kawali Silog - Php 159.00.jpg", "Silog Meal"),
  item("Liempo Silog", "Grilled pork belly served with garlic rice and egg.", "P159", "SILOG MEALS", "Liempo Silog - Php 159.00.jpg", "Silog Meal"),
  item("Longsilog", "Filipino longganisa served with garlic rice and egg.", "P129", "SILOG MEALS", "Longsilog - Php 129.00.jpg", "Silog Meal"),
  item("Lumpia Silog", "Crisp fried spring rolls served with garlic rice and egg.", "P119", "SILOG MEALS", "Lumpia Silog - Php 119.00.jpg", "Silog Meal"),
  item("Porkchop Silog", "Seasoned pork chop served with garlic rice and egg.", "P159", "SILOG MEALS", "Porkchop Silog - Php 159.00.jpg", "Silog Meal"),
  item("Sisig Silog", "Savory chopped pork sisig served with garlic rice and egg.", "P159", "SILOG MEALS", "Sisig Silog - Php 159.00.jpg", "Silog Meal"),
  item("Spamsilog", "Fried luncheon meat served with garlic rice and egg.", "P139", "SILOG MEALS", "Spamsilog - Php 139.00.jpg", "Silog Meal"),
  item("Tapsilog", "Marinated beef tapa served with garlic rice and egg.", "P169", "SILOG MEALS", "Tapsilog - Php 169.00.jpg", "Silog Meal"),
  item("Tosilog", "Sweet and savory tocino served with garlic rice and egg.", "P149", "SILOG MEALS", "Tosilog - Php 149.00.jpg", "Silog Meal"),
];

const studentMealItems: MainMenuSeedItem[] = [
  item("Buttered Chicken with Rice", "Buttered chicken bites served with rice and a simple side.", "P99", "STUDENT MEAL", "Buttered Chicken with Rice - Php 99.00.jpg", "Student Meal"),
  item("Chicken Chop", "Crispy chicken chop served with rice and a simple side.", "P79", "STUDENT MEAL", "Chicken Chop - Php 79.jpg", "Student Meal"),
];

const addOnItems: MainMenuSeedItem[] = [
  item("Atsara", "Pickled green papaya with a light sweet and tangy flavor.", "P29", "ADD-ONS", "Atsara - Php 29.00.jpg", "Add-on"),
  item("Boiled Egg", "One boiled egg for adding to rice, goto, or noodles.", "P15", "ADD-ONS", "Boiled Egg - Php 15.00.jpg", "Add-on"),
  item("Chicharon Bulaklak", "Crispy fried pork ruffle fat served as an extra side.", "P79", "ADD-ONS", "chicharon bulaklak - Php 79.00.jpg", "Add-on"),
  item("Fried Siomai", "Fried dumplings served with a savory dipping sauce.", "P29", "ADD-ONS", "Fried Siomai - Php 29.00.jpg", "Add-on"),
  item("Lechon Kawali", "Crispy pork belly pieces served as an extra side.", "P79", "ADD-ONS", "lechon-kawali - Php 79.00.jpg", "Add-on"),
  item("Lumpia", "Crisp fried spring rolls served with dipping sauce.", "P59", "ADD-ONS", "Lumpia - Php 59.00.jpg", "Add-on"),
  item("Plain Rice", "A serving of warm plain rice.", "P30", "ADD-ONS", "Plain Rice - Php 30.00.jpg", "Add-on"),
  item("Scrambled Egg", "A freshly cooked scrambled egg for any meal.", "P20", "ADD-ONS", "Scrambled Egg - Php 20.00.jpg", "Add-on"),
  item("Steamed Siomai", "Steamed dumplings served with a savory dipping sauce.", "P29", "ADD-ONS", "Steamed Siomai - Php 29.00.jpg", "Add-on"),
  item("Tokwa Only", "Fried tofu served with a soy and vinegar dipping sauce.", "P29", "ADD-ONS", "Tokwa Only - Php 29.00.jpg", "Add-on"),
  item("Tokwa't Baboy", "Fried tofu and pork tossed with a tangy soy-vinegar dressing.", "P99", "ADD-ONS", "Tokwa_t Baboy - Php 99.00.jpg", "Add-on"),
];

const drinkItems: MainMenuSeedItem[] = [
  item("Bottled Water", "Chilled bottled drinking water.", "P20", "DRINKS", "Bottled Water - Php 20.00.jpg", "Bottled Drink"),
  item("C2 Apple Solo", "A single bottle of apple-flavored green tea.", "P20", "DRINKS", "C2 Apple Solo - Php 20.00.jpg", "Bottled Drink"),
  item("C2 Lemon Solo", "A single bottle of lemon-flavored green tea.", "P20", "DRINKS", "C2 Lemon Solo - Php 20.00.jpg", "Bottled Drink"),
  item("Coffee Jelly", "A chilled creamy drink with soft coffee jelly pieces.", "P90", "DRINKS", "Coffee Jelly - Php 90.00.jpg", "Specialty Drink"),
  item("Coke 1.5L", "A 1.5-liter bottle of Coca-Cola for sharing.", "P85", "DRINKS", "Coke 1.5L - Php 85.00.jpg", "Soft Drink"),
  item("Coke Mismo", "A chilled solo bottle of Coca-Cola.", "P25", "DRINKS", "Coke Mismo - Php 25.00.jpg", "Soft Drink"),
  item("Mountain Dew", "A chilled solo bottle of Mountain Dew.", "P25", "DRINKS", "Mountain Dew - Php 25.00.jpg", "Soft Drink"),
  item("Mountain Dew 1.5L", "A 1.5-liter bottle of Mountain Dew for sharing.", "P85", "DRINKS", "Mountain Dew 1.5L - Php 85.00.jpg", "Soft Drink"),
  item("Royal Mismo", "A chilled solo bottle of Royal orange soda.", "P25", "DRINKS", "Royal Mismo - Php 25.00.jpg", "Soft Drink"),
  item("Sprite 1.5L", "A 1.5-liter bottle of Sprite for sharing.", "P85", "DRINKS", "Sprite 1.5L - Php 85.00.jpg", "Soft Drink"),
  item("Sprite Mismo", "A chilled solo bottle of Sprite.", "P25", "DRINKS", "Sprite Mismo - Php 25.00.jpg", "Soft Drink"),
];

export const MAIN_MENU_SEED_ITEMS = {
  "main-dish": mainDishItems,
  "student-meal": studentMealItems,
  "add-ons": addOnItems,
  drinks: drinkItems,
} as const;

export function getMainMenuSeedItems(slug: string) {
  return MAIN_MENU_SEED_ITEMS[slug as keyof typeof MAIN_MENU_SEED_ITEMS] ?? null;
}
