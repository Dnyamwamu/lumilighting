import { ClerkProvider } from "@clerk/nextjs"
import { shadcn } from "@clerk/ui/themes"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

import { CartProvider } from "@/context/CartContext"
import { WishlistProvider } from "@/context/WishlistContext"
import CookieConsent from "@/components/layout/CookieConsent"
import WhatsAppWidget from "@/components/layout/WhatsAppWidget"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="font-sans antialiased">
      <body>
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
