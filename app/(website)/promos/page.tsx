import { StudentMealsShowcase } from "@/components/page-component/StudentMealsShowcase";
import { requireActiveHeaderRoute } from "@/lib/header-navigation";
import { getPublicCampaign } from "@/lib/management";

export const dynamic = "force-dynamic";

export default async function PromosPage() {
  await requireActiveHeaderRoute("promo");

  const campaign = await getPublicCampaign("promo");

  return (
    <StudentMealsShowcase
      campaign={campaign}
      realtimeCategory="promo"
      sectionId="promos"
      footerEyebrow="More value together"
      footerTitle="Choose a bundle, then continue with your food order."
      chooseLabel="Choose Promos"
      decorationTheme="promo"
    />
  );
}
