import { HeroPage } from "@/components/page-component/HeroPage";
import { MenuPage } from "@/components/page-component/MenuPage";
import { Ticker } from "@/components/page-component/Ticker";

export default function HomePage() {
  return (
    <>
      <HeroPage />
      <Ticker />
      <MenuPage />
    </>
  );
}
