import { StudentMealsShowcase } from "@/components/page-component/StudentMealsShowcase";
import { requireActiveHeaderRoute } from "@/lib/header-navigation";
import { getPublicCampaign } from "@/lib/management";

export const dynamic = "force-dynamic";

export default async function StudentMealsPage() {
  await requireActiveHeaderRoute("student-meal");

  const campaign = await getPublicCampaign("student-meal");

  return <StudentMealsShowcase campaign={campaign} />;
}
