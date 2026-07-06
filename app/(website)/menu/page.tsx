import { MenuPage } from "@/components/page-component/MenuPage";
import { Ticker } from "@/components/page-component/Ticker";
import { getPublicMenuDishes } from "@/lib/management";

export const dynamic = "force-dynamic";

export default async function MenuRoutePage() {
  const dishes = await getPublicMenuDishes();

  return (
    <>
      <MenuPage dishes={dishes} />
      <Ticker />
    </>
  );
}
