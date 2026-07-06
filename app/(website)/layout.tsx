import { Header } from "@/components/page-component/Header";

export default function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-brand-cream">
      <Header />
      <main>{children}</main>
    </div>
  );
}
