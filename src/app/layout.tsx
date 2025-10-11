import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import Providers from '@/components/Providers';
import WhatsAppButton from '@/components/WhatsAppButton';
import ChatbotSimple from '@/components/ChatbotSimple';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Imóveis em Brasília - Casas e Apartamentos | BS Imóveis",
    template: "%s | BS Imóveis"
  },
  description: "Encontre seu imóvel ideal em Brasília e Distrito Federal. Casas, apartamentos e terrenos para venda e aluguel. Atendimento especializado na BS Imóveis DF.",
  keywords: ["imóveis brasília", "casas brasília df", "apartamentos brasília", "venda imóveis df", "aluguel brasília", "imobiliária brasília", "bs imóveis", "imóveis distrito federal"],
  authors: [{ name: "BS Imóveis DF" }],
  creator: "BS Imóveis DF",
  publisher: "BS Imóveis DF",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.bsimoveisdf.com.br",
    siteName: "BS Imóveis",
    title: "Imóveis em Brasília - Casas e Apartamentos | BS Imóveis",
    description: "Encontre seu imóvel ideal em Brasília e Distrito Federal. Casas, apartamentos e terrenos para venda e aluguel. Atendimento especializado na BS Imóveis DF.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Imóveis em Brasília - Casas e Apartamentos | BS Imóveis",
    description: "Encontre seu imóvel ideal em Brasília e Distrito Federal. Casas, apartamentos e terrenos para venda e aluguel. Atendimento especializado na BS Imóveis DF.",
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
    "name": "BS Imóveis",
    "description": "Encontre seu imóvel ideal em Brasília e Distrito Federal. Casas, apartamentos e terrenos para venda e aluguel. Atendimento especializado na BS Imóveis.",
    "url": "https://www.bsimoveisdf.com.br",
    "logo": "https://www.bsimoveisdf.com.br/logo.png",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BR",
      "addressRegion": "DF",
      "addressLocality": "Brasília",
      "streetAddress": "QR 218 Conj. O Lote 30"
    },
    "areaServed": {
      "@type": "City",
      "name": "Brasília"
    },
    "serviceType": ["Venda de Imóveis", "Aluguel de Imóveis", "Consultoria Imobiliária"]
  }

  return (
    <html lang="pt-BR">
      <head>
        <link rel="preload" as="font" href="/fontawesome/webfonts/fa-solid-900.woff2" type="font/woff2" crossOrigin="anonymous"/>
        <link rel="preload" as="font" href="/fontawesome/webfonts/fa-brands-400.woff2" type="font/woff2" crossOrigin="anonymous"/>
        <link rel="preload" as="font" href="/fontawesome/webfonts/fa-light-300.woff2" type="font/woff2" crossOrigin="anonymous"/>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
      </head>
      <body
        className={`${sora.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <Providers>
          {children}
          <WhatsAppButton />
          <ChatbotSimple />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            toastStyle={{
              backgroundColor: '#000000',
              color: '#ffffff'
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
