import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ImobiNext - Imóveis para Venda e Aluguel",
    template: "%s - ImobiNext"
  },
  description: "Encontre casas, apartamentos e coberturas para venda e aluguel. A melhor seleção de imóveis em São Paulo, Rio de Janeiro e todo o Brasil.",
  keywords: ["imóveis", "casas", "apartamentos", "venda", "aluguel", "São Paulo", "Rio de Janeiro", "imobiliária"],
  authors: [{ name: "ImobiNext" }],
  creator: "ImobiNext",
  publisher: "ImobiNext",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://imobinext.com.br",
    siteName: "ImobiNext",
    title: "ImobiNext - Imóveis para Venda e Aluguel",
    description: "Encontre casas, apartamentos e coberturas para venda e aluguel.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ImobiNext - Imóveis para Venda e Aluguel",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
