export const DEFAULT_CHATBOT_KNOWLEDGE = [
  {
    question: "How do I place a delivery order?",
    answer:
      "Add dishes to your cart, open your food order, then select Continue to Delivery. Enter your contact details, delivery address, preferred date and time, and any food or rider instructions.",
    keywords: "food meal order delivery address schedule cart rider instructions",
    category: "Orders",
    isFeatured: true,
  },
  {
    question: "Can I order food for delivery?",
    answer:
      "Yes. Add dishes to your cart, select Continue to Delivery, and complete the delivery details form. Binday's Diner currently accepts delivery requests only.",
    keywords: "delivery deliver home order cart address food",
    category: "Orders",
    isFeatured: true,
  },
  {
    question: "How do I join the loyalty program?",
    answer:
      "Open the Loyalty page and select Join Now. After registration, the site creates your unique loyalty QR code, which you can save and present during a visit.",
    keywords: "loyalty join register qr code membership rewards",
    category: "Loyalty",
    isFeatured: true,
  },
  {
    question: "How do loyalty stamps work?",
    answer:
      "A registered member receives one stamp for one meal order per person on each visit. Staff scan the member QR code and confirm the next available stamp with the staff PIN.",
    keywords: "loyalty stamp meal visit qr reward staff",
    category: "Loyalty",
    isFeatured: false,
  },
  {
    question: "Where can I find student meals?",
    answer:
      "Visit the Student Meals page to see the available budget-friendly dishes and their current prices.",
    keywords: "student meals budget affordable price menu",
    category: "Menu",
    isFeatured: true,
  },
  {
    question: "Where can I see current promos?",
    answer:
      "Visit the Promos page for the offers currently published by Binday's Diner. Only active offers shown on that page should be considered available.",
    keywords: "promo promotion discount deal offer bundle current",
    category: "Promos",
    isFeatured: false,
  },
  {
    question: "How do I add food to my reservation?",
    answer:
      "Select a dish from any menu or campaign page, choose the quantity, and add it to your cart. From the cart, select Reserve These Items and continue to the reservation form.",
    keywords: "add food preorder reservation quantity cart dish",
    category: "Orders",
    isFeatured: false,
  },
] as const;
