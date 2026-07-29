import { HeroPage } from "@/components/page-component/HeroPage";
import { MenuPage } from "@/components/page-component/MenuPage";
import { OurStorySection } from "@/components/page-component/OurStorySection";
import { Ticker } from "@/components/page-component/Ticker";
import { getPublicMenuDishes } from "@/lib/management";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const dishes = await getPublicMenuDishes();

  return (
    <>
      <HeroPage />
      <Ticker />
      <OurStorySection />
      <MenuPage dishes={dishes} />
    </>
  );
}
