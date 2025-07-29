import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// import { ThemeProvider } from "@/components/theme-provider"
// import { Navigation } from "@/components/navigation"
// import { Footer } from "@/components/footer"
// import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/navbar"
import { getSettings } from "@/lib/settings"

const inter = Inter({ subsets: ["latin"] })

const settings = getSettings()

export const metadata: Metadata = {
  title: settings.siteName,
  description: settings.siteDescription,
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
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
        <Navbar />
        {children}
      </body>
    </html>
  )
}
