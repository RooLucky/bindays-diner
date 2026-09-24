import { CONCERN_CONTACT, STORE_CONTACT } from "@/lib/contact-details";
import { LOYALTY_REWARD_THRESHOLD } from "@/lib/loyalty-progress";

// These approved facts are shared by initial seeding and the targeted update
// script. Public chatbot answers still come only from active database rows.
export const SERVICE_CHATBOT_KNOWLEDGE = [
  {
    question: "Where is Binday's Diner located?",
    answer: `Binday's Diner is at the corner of T. Alonzo Street, ground floor of Ranola Building, Oro Site, Legazpi City, Albay, Philippines. You may contact the store at ${STORE_CONTACT.phone}.`,
    keywords: `location located address directions map legazpi albay oro site t alonzo ranola ${STORE_CONTACT.phone}`,
    category: "About",
    isFeatured: true,
  },
  {
    question: "How can I contact the store?",
    answer: `For general store inquiries, call Binday's Diner at ${STORE_CONTACT.phone}. For any concern, email ${CONCERN_CONTACT.email} or call ${CONCERN_CONTACT.phone}. You can also find these details on the Concerns page at ${CONCERN_CONTACT.pageHref}.`,
    keywords: `contact store phone telephone number call inquiry inquiries hotline ${STORE_CONTACT.phone}`,
    category: "Contact",
    isFeatured: false,
  },
  {
    question: "Where can I raise a concern or complaint?",
    answer: `For any concern about your order, visit, or experience at Binday's Diner, email ${CONCERN_CONTACT.email} or call ${CONCERN_CONTACT.phone}. Please include the details of your concern and your order reference, if available. The Concerns page is at ${CONCERN_CONTACT.pageHref}.`,
    keywords: `concern concerns complaint complaints feedback problem issue issues help support email contact reklamo problema report order service ${CONCERN_CONTACT.email} ${CONCERN_CONTACT.phone}`,
    category: "Contact",
    isFeatured: false,
  },
  {
    question: "What happens when I complete all 10 loyalty stamps?",
    answer: `After completing ${LOYALTY_REWARD_THRESHOLD} stamps, you earn a reward and your loyalty card automatically resets to 0/${LOYALTY_REWARD_THRESHOLD} for the next card. Your earned reward stays available until staff redeem it, and you can keep collecting stamps while rewards are unclaimed. Present your existing loyalty QR code to staff to redeem a reward.`,
    keywords: "loyalty card complete completed completing full 10 ten slots stamps reset automatic next cycle reward rewards redeem redemption claim unclaimed",
    category: "Loyalty",
    isFeatured: false,
  },
] as const;
