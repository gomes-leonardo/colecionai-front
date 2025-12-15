import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import { CartProvider } from "@/contexts/CartContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AcademicFeaturesWrapper } from "@/components/shared/academic-features-wrapper";
import { AnalysisModeProvider } from "@/contexts/AnalysisModeContext";
import { AnalysisModeChoiceModal } from "@/components/analysis/AnalysisModeChoiceModal";
import { AnalysisHUD } from "@/components/analysis/AnalysisHUD";
import { NotificationListener } from "@/components/shared/notification-listener";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Colecionaí - Marketplace de Colecionáveis",
  description: "Compre e venda itens colecionáveis raros e únicos",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <QueryProvider>
          <NotificationProvider>
            <CartProvider>
              <AnalysisModeProvider>
                <AcademicFeaturesWrapper>
                  {children}
                </AcademicFeaturesWrapper>
                <AnalysisModeChoiceModal />
                <AnalysisHUD />
                <NotificationListener />
                <Toaster />
              </AnalysisModeProvider>
            </CartProvider>
          </NotificationProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
