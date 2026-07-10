import { Header } from "@/components/page-component/Header";
import { CartProvider } from "@/components/page-component/CartProvider";
import { WebsiteMotionShell } from "@/components/page-component/WebsiteMotionShell";
import { WebsiteScrollProgress } from "@/components/page-component/WebsiteScrollProgress";
import { ChatbotWidget } from "@/components/page-component/ChatbotWidget";

export default function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <CartProvider>
        <WebsiteScrollProgress />
        <Header />
        <WebsiteMotionShell>{children}</WebsiteMotionShell>
        <ChatbotWidget />
      </CartProvider>
    </div>
  );
}
