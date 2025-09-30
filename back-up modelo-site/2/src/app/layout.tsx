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
    default: "Arbo - Plataforma Imobiliária",
    template: "%s - Arbo"
  },
  description: "Encontre seu novo lar através das imobiliárias que anunciam no site Arbo. Utilize filtros e encontre os melhores imóveis, preços e regiões. Soluções Imobiliárias.",
  keywords: ["imóveis", "casas", "apartamentos", "venda", "aluguel", "imobiliária", "arbo", "plataforma imobiliária"],
  authors: [{ name: "Arbo Imóveis" }],
  creator: "Arbo Imóveis",
  publisher: "Arbo Imóveis",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.arboimoveis.com.br",
    siteName: "Arbo Imóveis",
    title: "Arbo - Plataforma Imobiliária",
    description: "Encontre seu novo lar através das imobiliárias que anunciam no site Arbo. Utilize filtros e encontre os melhores imóveis, preços e regiões. Soluções Imobiliárias.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arbo - Plataforma Imobiliária",
    description: "Encontre seu novo lar através das imobiliárias que anunciam no site Arbo. Utilize filtros e encontre os melhores imóveis, preços e regiões. Soluções Imobiliárias.",
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
    "name": "Arbo Imóveis",
    "description": "Encontre seu novo lar através das imobiliárias que anunciam no site Arbo. Utilize filtros e encontre os melhores imóveis, preços e regiões. Soluções Imobiliárias.",
    "url": "https://www.arboimoveis.com.br",
    "logo": "https://www.arboimoveis.com.br/static/logo_arbo.svg",
    "image": "https://static.arboimoveis.com.br/white-label-assets/arbo/metadata-arbo-imoveis.png",
    "telephone": "+55-11-4040-3939",
    "email": "contato@arboimoveis.com",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BR",
      "addressRegion": "PR",
      "addressLocality": "Londrina",
      "postalCode": "86060-000",
      "streetAddress": "R. Lima, 302 - Vitoria"
    },
    "sameAs": [
      "https://www.facebook.com/arboimoveis",
      "https://www.instagram.com/arboimoveis",
      "https://br.linkedin.com/company/arboimoveis",
      "https://blog.arboimoveis.com.br/"
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
