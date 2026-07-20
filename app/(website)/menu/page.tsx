import { StudentMealsShowcase } from "@/components/page-component/StudentMealsShowcase";
import { getPublicCampaign } from "@/lib/management";

export const dynamic = "force-dynamic";

export default async function MenuRoutePage() {
  const campaign = await getPublicCampaign("main-dish");

  return (
    <StudentMealsShowcase
      campaign={campaign}
      realtimeCategory="main-dish"
      sectionId="menu-dishes"
      footerEyebrow="The full menu"
      footerTitle="Build your food order from the dishes you love."
      chooseLabel="Choose Dishes"
      decorationTheme="menu"
    />
  );
}
