import { CampaignPage } from "@/components/page-component/CampaignPage";
import { getPublicCampaign } from "@/lib/management";

export const dynamic = "force-dynamic";

export default async function BestSellerPage() {
  const campaign = await getPublicCampaign("best-seller");

  return <CampaignPage campaign={campaign} />;
}
