import { StudentMealsShowcase } from "@/components/page-component/StudentMealsShowcase";
import { getPublicCampaign } from "@/lib/management";

export const dynamic = "force-dynamic";

export default async function AddOnsPage() {
  const campaign = await getPublicCampaign("add-ons");

  return (
    <StudentMealsShowcase
      campaign={campaign}
      realtimeCategory="add-ons"
      sectionId="add-ons"
      footerEyebrow="Complete your order"
      footerTitle="Choose the extras that make your meal just right."
      chooseLabel="Choose Add-ons"
      decorationTheme="food"
    />
  );
}
