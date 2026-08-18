import { StudentMealsShowcase } from "@/components/page-component/StudentMealsShowcase";
import { requireActiveHeaderRoute } from "@/lib/header-navigation";
import { getPublicCampaign } from "@/lib/management";

export const dynamic = "force-dynamic";

export default async function AddOnsPage() {
  await requireActiveHeaderRoute("add-ons");

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
