import { CampaignPage } from "@/components/page-component/CampaignPage";
import { campaigns } from "@/lib/menu-campaigns";

export default function PromosPage() {
  return <CampaignPage campaign={campaigns.promos} />;
}

