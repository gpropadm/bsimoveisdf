import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import Providers from '@/components/Providers';
import WhatsAppButton from '@/components/WhatsAppButton';
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
    default: "All - Plataforma Imobiliária",
    template: "%s - All"
  },
  description: "Encontre seu novo lar através das imobiliárias que anunciam no site All. Utilize filtros e encontre os melhores imóveis, preços e regiões. Soluções Imobiliárias.",
  keywords: ["imóveis", "casas", "apartamentos", "venda", "aluguel", "imobiliária", "all", "plataforma imobiliária"],
  authors: [{ name: "All Imóveis" }],
  creator: "All Imóveis",
  publisher: "All Imóveis",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.allimobiliaria.com.br",
    siteName: "All Imóveis",
    title: "All - Plataforma Imobiliária",
    description: "Encontre seu novo lar através das imobiliárias que anunciam no site All. Utilize filtros e encontre os melhores imóveis, preços e regiões. Soluções Imobiliárias.",
  },
  twitter: {
    card: "summary_large_image",
    title: "All - Plataforma Imobiliária",
    description: "Encontre seu novo lar através das imobiliárias que anunciam no site All. Utilize filtros e encontre os melhores imóveis, preços e regiões. Soluções Imobiliárias.",
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
    "@type": "Organization",
    "name": "All Imóveis",
    "description": "Encontre seu novo lar através das imobiliárias que anunciam no site All. Utilize filtros e encontre os melhores imóveis, preços e regiões. Soluções Imobiliárias.",
    "url": "https://www.allimobiliaria.com.br",
    "logo": "https://www.allimobiliaria.com.br/static/logo_all.svg",
    "image": "https://static.allimobiliaria.com.br/white-label-assets/all/metadata-all-imoveis.png",
    "telephone": "+55-11-4040-3939",
    "email": "contato@allimobiliaria.com",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BR",
      "addressRegion": "DF",
      "addressLocality": "Brasília",
      "postalCode": "70000-000",
      "streetAddress": "Setor Comercial Sul"
    },
    "sameAs": [
      "https://www.facebook.com/allimobiliaria",
      "https://www.instagram.com/allimobiliaria",
      "https://br.linkedin.com/company/allimobiliaria",
      "https://blog.allimobiliaria.com.br/"
    ],
    "serviceType": ["Venda de Imóveis", "Aluguel de Imóveis", "Plataforma Imobiliária", "Financiamento Imobiliário"]
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
