import { Header } from "@/components/page-component/Header";
import { CartProvider } from "@/components/page-component/CartProvider";
import { WebsiteMotionShell } from "@/components/page-component/WebsiteMotionShell";
import { WebsiteScrollProgress } from "@/components/page-component/WebsiteScrollProgress";
import { ChatbotWidget } from "@/components/page-component/ChatbotWidget";
import { Footer } from "@/components/page-component/Footer";
import { getHeaderNavigationVisibility } from "@/lib/header-navigation";
import { isAblyRealtimeEnabled } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export default async function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navigationVisibility = await getHeaderNavigationVisibility();
  const realtimeEnabled = isAblyRealtimeEnabled();

  return (
  <div className="min-h-screen bg-background">
      <CartProvider>
        <WebsiteScrollProgress />
        <Header
          navigationVisibility={navigationVisibility}
          realtimeEnabled={realtimeEnabled}
        />
        <WebsiteMotionShell>{children}</WebsiteMotionShell>
        <Footer />
        <ChatbotWidget />
      </CartProvider>
    </div>
  );
}
