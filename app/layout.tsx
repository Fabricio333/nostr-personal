import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
// import { Navigation } from "@/components/navigation"
// import { Footer } from "@/components/footer"
// import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/navbar"
import { getSettings, getSiteName, getOwnerNpub } from "@/lib/settings"
import { cacheProfilePicture } from "@/lib/profile-picture-cache"
import { I18nProvider } from "@/components/locale-provider"

const inter = Inter({ subsets: ["latin"] })


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSettings()
  const siteName = await getSiteName()
  const ownerNpub = getOwnerNpub()
  let profileImage = "/icon.svg"
  if (ownerNpub) {
    const cached = await cacheProfilePicture(ownerNpub)
    if (cached) {
      profileImage = cached
    }
  }
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
      images: [profileImage],
    },
    twitter: {
      card: "summary",
      title: siteName,
      description: settings.siteDescription,
      images: [profileImage],
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
        <body className={`${inter.className} w-full`}>
          <I18nProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <Navbar siteName={siteName} />
              {children}
            </ThemeProvider>
          </I18nProvider>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-G8586BX397"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-G8586BX397');
            `}
          </Script>
        </body>
    </html>
  )
}
