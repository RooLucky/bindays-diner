import { CampaignPage } from "@/components/page-component/CampaignPage";
import { campaigns } from "@/lib/menu-campaigns";

export default function StudentMealsPage() {
  return <CampaignPage campaign={campaigns["student-meals"]} />;
}

