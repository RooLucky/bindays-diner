import { StudentMealsShowcase } from "@/components/page-component/StudentMealsShowcase";
import { getPublicCampaign } from "@/lib/management";

export const dynamic = "force-dynamic";

export default async function DrinksPage() {
  const campaign = await getPublicCampaign("drinks");

  return (
    <StudentMealsShowcase
      campaign={campaign}
      realtimeCategory="drinks"
      sectionId="drinks"
      footerEyebrow="House refreshments"
      footerTitle="Add the right drink to complete your food order."
      chooseLabel="Choose Drinks"
      decorationTheme="coffee"
    />
  );
}
