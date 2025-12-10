import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import { CartProvider } from "@/contexts/CartContext";
import { AcademicFeaturesWrapper } from "@/components/shared/academic-features-wrapper";
import { AnalysisModeProvider } from "@/contexts/AnalysisModeContext";
import { AnalysisModeChoiceModal } from "@/components/analysis/AnalysisModeChoiceModal";
import { AnalysisHUD } from "@/components/analysis/AnalysisHUD";

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
          <CartProvider>
            <AnalysisModeProvider>
              <AcademicFeaturesWrapper>
                {children}
              </AcademicFeaturesWrapper>
              <AnalysisModeChoiceModal />
              <AnalysisHUD />
              <Toaster />
            </AnalysisModeProvider>
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
