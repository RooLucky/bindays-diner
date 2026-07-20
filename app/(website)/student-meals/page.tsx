import { StudentMealsShowcase } from "@/components/page-component/StudentMealsShowcase";
import { getPublicCampaign } from "@/lib/management";

export const dynamic = "force-dynamic";

export default async function StudentMealsPage() {
  const campaign = await getPublicCampaign("student-meal");

  return <StudentMealsShowcase campaign={campaign} />;
}
