import {
  BINDAYS_MOTTO,
  BINDAYS_STORY_ANSWER,
} from "@/lib/brand-content";

export const DEFAULT_CHATBOT_KNOWLEDGE = [
  {
    question: "What is Binday's Diner?",
    answer:
      "Binday's Diner is a casual Filipino restaurant and neighborhood hangout in Legazpi City. It serves affordable, satisfying meals with the familiar comfort of home, including breakfast favorites, rice meals, noodles, platters, snacks, and drinks.",
    keywords:
      "about binday bindays diner restaurant history story filipino legazpi home comfort food",
    category: "About",
    isFeatured: true,
  },
  {
    question: "What is Binday's Diner's motto?",
    answer: BINDAYS_MOTTO,
    keywords:
      "motto moto slogan tagline catchphrase every meal feels like home",
    category: "About",
    isFeatured: false,
  },
  {
    question: "What is the story of Binday's Diner?",
    answer: BINDAYS_STORY_ANSWER,
    keywords:
      "our story history origin dream family journey perseverance sacrifice faith resilience love generosity hope community hospitality every meal feels like home",
    category: "About",
    isFeatured: false,
  },
  {
    question: "When did Binday's Diner open?",
    answer:
      "Binday's Diner held its grand opening on February 28, 2026, in Legazpi City.",
    keywords:
      "started start founded established opened opening grand opening date history february 28 2026",
    category: "About",
    isFeatured: false,
  },
  {
    question: "What food does Binday's Diner offer?",
    answer:
      "Binday's Diner offers Filipino comfort food for breakfast, lunch, dinner, and casual food trips. The menu includes goto, mami, pares meals, platters, silog meals, student meals, main dishes, add-ons, and refreshing drinks. Visit the menu pages for the current dishes and prices.",
    keywords:
      "offers serves food menu breakfast lunch dinner goto mami pares platter silog student meals main dishes add-ons drinks",
    category: "About",
    isFeatured: true,
  },
  {
    question: "What time does Binday's Diner open and close?",
    answer:
      "Binday's Diner is currently listed as open daily from 7:00 AM to 10:00 PM. Business hours can change on holidays or special occasions, so check the restaurant's latest Facebook update before visiting.",
    keywords:
      "hours schedule business hours opening closing open close time daily today monday tuesday wednesday thursday friday saturday sunday",
    category: "About",
    isFeatured: true,
  },
  {
    question: "Where is Binday's Diner located?",
    answer:
      "Binday's Diner is at the corner of T. Alonzo Street, ground floor of Ranola Building, Oro Site, Legazpi City, Albay, Philippines. You may contact the restaurant at +63 992 945 0801.",
    keywords:
      "location located address directions map contact phone telephone legazpi albay oro site t alonzo ranola 09929450801",
    category: "About",
    isFeatured: true,
  },
  {
    question: "Does Binday's Diner offer dine-in, takeout, or delivery?",
    answer:
      "Binday's Diner welcomes guests at its Legazpi City location and is listed for takeout. This website currently accepts delivery requests, and the restaurant is also listed on GrabFood and foodpanda. Availability may depend on the restaurant's current hours and delivery area.",
    keywords:
      "dine in dine-in takeaway takeout pickup delivery grabfood foodpanda visit restaurant order",
    category: "About",
    isFeatured: false,
  },
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
