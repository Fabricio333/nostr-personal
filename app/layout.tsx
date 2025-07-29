import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// import { ThemeProvider } from "@/components/theme-provider"
// import { Navigation } from "@/components/navigation"
// import { Footer } from "@/components/footer"
// import { Toaster } from "@/components/ui/toaster"
import { getSettings } from "@/lib/settings"

const inter = Inter({ subsets: ["latin"] })

const settings = getSettings()

export const metadata: Metadata = {
  title: settings.siteName,
  description: settings.siteDescription,
  generator: "v0.dev",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: settings.siteName,
    description: settings.siteDescription,
    images: ["/icon.svg"],
  },
  twitter: {
    card: "summary",
    title: settings.siteName,
    description: settings.siteDescription,
    images: ["/icon.svg"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/*
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
            <Navigation />
            <main className="container mx-auto px-4 py-8">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
        */}
        {children}
      </body>
    </html>
  )
}
