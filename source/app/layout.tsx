import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Figtree } from "next/font/google";
import { obterConfig } from "@/lib/configuracoes";
import { site } from "@/lib/site";
import "./globals.css";

/** Display: alto contraste, do mesmo desenho das letras do logotipo. */
const bodoni = Bodoni_Moda({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-bodoni",
  weight: ["400", "500", "600", "700"],
});

/** Texto corrido: neutra, aberta, boa em tamanhos pequenos. */
const figtree = Figtree({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-figtree",
});

/** Título, descrição e palavras-chave vêm do painel, em Configurações. */
export async function generateMetadata(): Promise<Metadata> {
  const config = obterConfig();

  return {
  metadataBase: new URL(config.siteUrl || site.url),
  title: {
    default: config.seoTitulo,
    template: `%s · ${config.nomeDaRadio}`,
  },
  description: config.seoDescricao,
  applicationName: config.nomeDaRadio,
  keywords: config.seoPalavras
    .split(",")
    .map((palavra) => palavra.trim())
    .filter(Boolean),
  authors: [{ name: config.nomeDaRadio, url: config.siteUrl || site.url }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: config.siteUrl || site.url,
    siteName: config.nomeDaRadio,
    title: config.seoTitulo,
    description: config.seoDescricao,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: `Logotipo da rádio ${config.nomeDaRadio}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: config.seoTitulo,
    description: config.seoDescricao,
    images: ["/og-image.jpg"],
  },
  ...(config.googleVerificacao
    ? { verification: { google: config.googleVerificacao } }
    : {}),
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  };
}

export const viewport: Viewport = {
  themeColor: "#14100b",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${bodoni.variable} ${figtree.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
