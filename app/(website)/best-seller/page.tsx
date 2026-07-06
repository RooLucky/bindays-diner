import { CampaignPage } from "@/components/page-component/CampaignPage";
import { campaigns } from "@/lib/menu-campaigns";

export default function BestSellerPage() {
  return <CampaignPage campaign={campaigns["best-seller"]} />;
}

