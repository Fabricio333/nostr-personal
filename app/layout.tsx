import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
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
      <body className={`${inter.className} w-full overflow-x-hidden`}>
        <Navbar siteName={siteName} />
        <main className="w-full max-w-screen-md mx-auto px-4">
          {children}
        </main>
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
