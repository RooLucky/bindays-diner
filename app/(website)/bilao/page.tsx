import { StudentMealsShowcase } from "@/components/page-component/StudentMealsShowcase";
import { requireActiveHeaderRoute } from "@/lib/header-navigation";
import { getPublicCampaign } from "@/lib/management";

export const dynamic = "force-dynamic";

export default async function BilaoPage() {
  await requireActiveHeaderRoute("bilao-tray");

  const campaign = await getPublicCampaign("bilao-tray");

  return (
    <StudentMealsShowcase
      campaign={campaign}
      realtimeCategory="bilao-tray"
      sectionId="bilao-trays"
      footerEyebrow="Made for sharing"
      footerTitle="Choose a Bilao Tray for your next gathering."
      chooseLabel="Choose Bilao Trays"
      decorationTheme="bilao"
    />
  );
}
