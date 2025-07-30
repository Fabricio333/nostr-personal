import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// import { ThemeProvider } from "@/components/theme-provider"
// import { Navigation } from "@/components/navigation"
// import { Footer } from "@/components/footer"
// import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/navbar"
import { getSettings, getSiteName } from "@/lib/settings"

const inter = Inter({ subsets: ["latin"] })


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSettings()
  const siteName = await getSiteName()
  return {
    title: siteName,
    description: settings.siteDescription,
    generator: "v0.dev",
    icons: {
      icon: "/icon.svg",
    },
    openGraph: {
      title: siteName,
      description: settings.siteDescription,
      images: ["/icon.svg"],
    },
    twitter: {
      card: "summary",
      title: siteName,
      description: settings.siteDescription,
      images: ["/icon.svg"],
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const siteName = await getSiteName()
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Navbar siteName={siteName} />
        {children}
      </body>
    </html>
  )
}
