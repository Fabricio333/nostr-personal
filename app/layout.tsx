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
import { getSettings, getSiteName } from "@/lib/settings"
import { ensurePreviewImage } from "@/lib/preview-image"

const inter = Inter({ subsets: ["latin"] })


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSettings()
  const siteName = await getSiteName()
  const previewImage = await ensurePreviewImage()
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
      images: [previewImage],
    },
    twitter: {
      card: "summary",
      title: siteName,
      description: settings.siteDescription,
      images: [previewImage],
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
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Navbar siteName={siteName} />
            {children}
          </ThemeProvider>
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
