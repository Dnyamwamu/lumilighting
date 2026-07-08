import type { Metadata } from "next";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUMI Lighting. | CEO Admin Dashboard",
  description: "Executive Business Intelligence Portal connecting Medusa, QuickBooks, and M-Pesa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        </head>
        <body>
          <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="glass-panel border-b border-theme-main sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <span className="text-black font-bold text-xl">L</span>
                </div>
                <div>
                  <h1 className="font-bold text-lg leading-tight tracking-wide text-theme-contrast">LUMI Lighting.</h1>
                  <p className="text-[10px] text-amber-500/80 uppercase tracking-widest font-semibold">Executive Portal</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-theme-muted font-medium">System Online</span>
                <UserButton />
              </div>
            </header>

            {/* Core Content */}
            <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
