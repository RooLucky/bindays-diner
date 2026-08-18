import { StudentMealsShowcase } from "@/components/page-component/StudentMealsShowcase";
import { requireActiveHeaderRoute } from "@/lib/header-navigation";
import { getPublicCampaign } from "@/lib/management";

export const dynamic = "force-dynamic";

export default async function BestSellerPage() {
  await requireActiveHeaderRoute("best-seller");

  const campaign = await getPublicCampaign("best-seller");

  return (
    <StudentMealsShowcase
      campaign={campaign}
      realtimeCategory="best-seller"
      sectionId="best-sellers"
      footerEyebrow="Loved by our guests"
      footerTitle="Start with the dishes customers order again and again."
      chooseLabel="Choose Best Sellers"
      decorationTheme="best-seller"
    />
  );
}
