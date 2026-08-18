import { StudentMealsShowcase } from "@/components/page-component/StudentMealsShowcase";
import { requireActiveHeaderRoute } from "@/lib/header-navigation";
import { getPublicCampaign } from "@/lib/management";

export const dynamic = "force-dynamic";

export default async function MealOfTheDayPage() {
  await requireActiveHeaderRoute("meal-of-the-day");

  const campaign = await getPublicCampaign("meal-of-the-day");

  return (
    <StudentMealsShowcase
      campaign={campaign}
      realtimeCategory="meal-of-the-day"
      sectionId="meal-of-the-day"
      footerEyebrow="Selected for today"
      footerTitle="Add today's kitchen picks before they change."
      chooseLabel="Choose Today's Meal"
      decorationTheme="daily"
    />
  );
}
