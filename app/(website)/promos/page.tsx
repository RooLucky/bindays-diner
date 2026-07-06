import { CampaignPage } from "@/components/page-component/CampaignPage";
import { getPublicCampaign } from "@/lib/management";

export const dynamic = "force-dynamic";

export default async function PromosPage() {
  const campaign = await getPublicCampaign("promo");

  return <CampaignPage campaign={campaign} />;
}
