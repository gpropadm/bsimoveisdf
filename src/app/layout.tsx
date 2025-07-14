import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";
import { ToastProvider } from "@/contexts/ToastContext";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Faimoveis - Imóveis para Venda e Aluguel",
    template: "%s - Faimoveis"
  },
  description: "Encontre casas, apartamentos e coberturas para venda e aluguel. A melhor seleção de imóveis em toda região com os melhores preços.",
  keywords: ["imóveis", "casas", "apartamentos", "venda", "aluguel", "faimoveis", "imobiliária"],
  authors: [{ name: "Faimoveis" }],
  creator: "Faimoveis",
  publisher: "Faimoveis",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://faimoveis.com.br",
    siteName: "Faimoveis",
    title: "Faimoveis - Imóveis para Venda e Aluguel",
    description: "Encontre casas, apartamentos e coberturas para venda e aluguel.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Faimoveis - Imóveis para Venda e Aluguel",
    description: "Encontre casas, apartamentos e coberturas para venda e aluguel.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${montserrat.variable} ${playfairDisplay.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
