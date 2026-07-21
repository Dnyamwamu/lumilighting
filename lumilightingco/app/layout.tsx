import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { shadcn } from "@clerk/ui/themes"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

import { CartProvider } from "@/context/CartContext"
import { WishlistProvider } from "@/context/WishlistContext"
import CookieConsent from "@/components/layout/CookieConsent"
import WhatsAppWidget from "@/components/layout/WhatsAppWidget"

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://lumilighting.co.ke"
  ),
  title: {
    default: "LUMI Lighting | Our Quality Marks The End Of The Tunnel",
    template: "%s | LUMI Lighting",
  },
  description:
    "Transform your space with premium light fittings from Lumi Lighting. Shop high-quality LED panels, chandeliers, outdoor floodlights, and decorative bulbs in Nairobi, Kenya.",
  keywords: [
    "Lumi Lighting",
    "premium lighting Kenya",
    "LED panel lights Nairobi",
    "chandeliers Kenya",
    "outdoor waterproof lights",
    "commercial lighting Nairobi",
    "decorative lights Kenya",
  ],
  authors: [{ name: "Lumi Lighting" }],
  openGraph: {
    title: "LUMI Lighting | Our Quality Marks The End Of The Tunnel",
    description:
      "Transform your space with premium light fittings from Lumi Lighting. Shop high-quality LED panels, chandeliers, outdoor floodlights, and decorative bulbs in Nairobi, Kenya.",
    url: "https://lumilighting.co.ke",
    siteName: "Lumi Lighting",
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LUMI Lighting | Our Quality Marks The End Of The Tunnel",
    description:
      "Transform your space with premium light fittings from Lumi Lighting. Shop high-quality LED panels, chandeliers, outdoor floodlights, and decorative bulbs in Nairobi, Kenya.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/favicon/site.webmanifest",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="font-sans antialiased">
      <body className="pt-[4px]">
        {/* Top Illuminating Color Strip */}
        <div className="fixed top-0 left-0 right-0 h-[4px] w-full z-50 illuminating-strip" />
        <ClerkProvider appearance={{ theme: shadcn }}>
          <ThemeProvider>
            <CartProvider>
              <WishlistProvider>
                {children}
                <CookieConsent />
                <WhatsAppWidget />
              </WishlistProvider>
            </CartProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
