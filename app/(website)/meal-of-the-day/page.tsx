import { CampaignPage } from "@/components/page-component/CampaignPage";
import { getPublicCampaign } from "@/lib/management";

export const dynamic = "force-dynamic";

export default async function MealOfTheDayPage() {
  const campaign = await getPublicCampaign("meal-of-the-day");

  return <CampaignPage campaign={campaign} />;
}
