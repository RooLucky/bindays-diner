import { CampaignPage } from "@/components/page-component/CampaignPage";
import { campaigns } from "@/lib/menu-campaigns";

export default function MealOfTheDayPage() {
  return <CampaignPage campaign={campaigns["meal-of-the-day"]} />;
}

