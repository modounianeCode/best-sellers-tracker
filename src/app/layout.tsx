import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radar des ventes — Amazon + AliExpress",
  description:
    "Observatoire des produits les plus vendus sur Amazon et AliExpress : prix, avis, vendeurs et baisses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#EDF1F6] text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
