import { CampaignPage } from "@/components/page-component/CampaignPage";
import { getPublicCampaign } from "@/lib/management";

export const dynamic = "force-dynamic";

export default async function StudentMealsPage() {
  const campaign = await getPublicCampaign("student-meal");

  return <CampaignPage campaign={campaign} />;
}
