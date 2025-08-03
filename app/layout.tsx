import type React from "react"
import type { Metadata, Viewport } from "next"
import { cookies, headers } from "next/headers"
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

const SPANISH_COUNTRIES = new Set([
  "AR",
  "BO",
  "CL",
  "CO",
  "CR",
  "CU",
  "DO",
  "EC",
  "ES",
  "GQ",
  "GT",
  "HN",
  "MX",
  "NI",
  "PA",
  "PE",
  "PR",
  "PY",
  "SV",
  "UY",
  "VE",
])

function detectLocale(): "en" | "es" {
  const cookieStore = cookies()
  let locale = cookieStore.get("NEXT_LOCALE")?.value as "en" | "es" | undefined
  if (!locale) {
    const country = headers().get("x-vercel-ip-country")?.toUpperCase() || ""
    locale = SPANISH_COUNTRIES.has(country) ? "es" : "en"
  }
  return locale
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSettings()
  const siteName = await getSiteName()
  const ownerNpub = getOwnerNpub()
  const locale = detectLocale()
  const headersList = headers()
  const host = headersList.get("x-forwarded-host") ||
    headersList.get("host") ||
    "localhost:3000"
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`
  const url = locale === "es" ? `${siteUrl}/es` : siteUrl
  let profileImage = "/icon.svg"
  if (ownerNpub) {
    const cached = await cacheProfilePicture(ownerNpub)
    if (cached) {
      profileImage = cached
    }
  }
  return {
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: url,
      languages: {
        en: siteUrl,
        es: `${siteUrl}/es`,
      },
    },
    title: siteName,
    description: settings.siteDescription,
    generator: "v0.dev",
    icons: {
      icon: "/icon.svg",
    },
    openGraph: {
      title: siteName,
      description: settings.siteDescription,
      url,
      siteName,
      type: "website",
      locale: locale === "es" ? "es_ES" : "en_US",
      images: [profileImage],
    },
    twitter: {
      card: "summary_large_image",
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
  const locale = detectLocale()
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} w-full`}>
        <I18nProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
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
