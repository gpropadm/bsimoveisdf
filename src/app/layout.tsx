import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Providers from '@/components/Providers';
import WhatsAppButton from '@/components/WhatsAppButton';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
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
  // LocalBusiness structured data
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Faimoveis",
    "description": "Imobiliária especializada em venda e aluguel de imóveis. Encontre casas, apartamentos e coberturas com os melhores preços da região.",
    "url": "https://faimoveis.com.br",
    "logo": "https://faimoveis.com.br/logo.png",
    "image": "https://faimoveis.com.br/logo.png",
    "telephone": "+55-48-99864-5864",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BR",
      "addressRegion": "SC",
      "addressLocality": "Florianópolis"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "-27.5973",
      "longitude": "-48.5496"
    },
    "openingHours": "Mo-Fr 08:00-18:00, Sa 08:00-12:00",
    "sameAs": [
      "https://www.instagram.com/faimoveis",
      "https://www.facebook.com/faimoveis"
    ],
    "areaServed": {
      "@type": "State",
      "name": "Santa Catarina"
    },
    "serviceType": ["Venda de Imóveis", "Aluguel de Imóveis", "Consultoria Imobiliária"]
  }

  return (
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <Providers>
          {children}
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
