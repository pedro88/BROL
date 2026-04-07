import type { Metadata, Viewport } from "next";
import { VT323, Inter } from "next/font/google";
import { Providers } from "../components/providers";
import "./globals.css";

/**
 * Configuration des polices Google Fonts.
 * VT323 = police monospace pixelisée style terminal/retro
 * Inter = police moderne pour le corps du texte
 */
const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Métadonnées de l'application.
 * @decisions SEO et PWA ready pour une PWA progressive.
 */
export const metadata: Metadata = {
  title: {
    default: "Brol — Gérez vos prêts",
    template: "%s | Brol",
  },
  description: "Application belge de gestion de prêt et location d'objets via QR codes.",
  keywords: ["pret", "location", "pret", "qr", "collection", "bd", "livres", "belgique"],
  authors: [{ name: "Brol" }],
  creator: "Brol",
  openGraph: {
    type: "website",
    locale: "fr_BE",
    url: "https://brol.app",
    siteName: "Brol",
    title: "Brol — Gérez vos prêts",
    description: "Application belge de gestion de prêt et location d'objets via QR codes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brol",
    description: "Gérez vos prêts d'objets facilement",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Configuration du viewport pour le responsive.
 */
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${vt323.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-background vhs-grid">
        {/* Overlay scanlines global */}
        <div className="fixed inset-0 pointer-events-none z-50 vhs-scanlines" />
        {/* Gradient overlay */}
        <div className="fixed inset-0 pointer-events-none z-40 vhs-gradient-overlay" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
