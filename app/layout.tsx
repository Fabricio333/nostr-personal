import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
// import { ThemeProvider } from "@/components/theme-provider"
// import { Navigation } from "@/components/navigation"
// import { Footer } from "@/components/footer"
// import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/navbar"
import { getSettings } from "@/lib/settings"
import { getNostrSettings } from "@/lib/nostr-settings"
import { fetchNostrProfile } from "@/lib/nostr"

const inter = Inter({ subsets: ["latin"] })

const settings = getSettings()

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const npub = getNostrSettings().ownerNpub
  let siteName = settings.siteName
  if (npub) {
    const profile = await fetchNostrProfile(npub)
    siteName =
      profile?.display_name || profile?.name || profile?.nip05?.split("@")[0] ||
      siteName
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Navbar siteName={siteName} />
        {children}
      </body>
    </html>
  )
}
