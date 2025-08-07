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
import { fetchNostrProfile } from "@/lib/nostr"
import { I18nProvider } from "@/components/locale-provider"
import { getCanonicalUrl } from "@/utils/getCanonicalUrl"

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
  const locale = detectLocale()
  const siteUrl = getCanonicalUrl()
  const url = locale === "es" ? `${siteUrl}/es` : siteUrl
  const profileImage = "/profile-picture.png"

  let description = settings.siteDescription
  const npub = getOwnerNpub()
  if (npub) {
    try {
      const profile = await fetchNostrProfile(npub, locale)
      if (profile?.about) {
        description = profile.about.replace(/\s+/g, " ").trim()
      }
    } catch {
      // ignore fetch errors
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
    description,
    generator: "v0.dev",
    icons: {
      icon: "/icon.svg",
    },
    openGraph: {
      title: siteName,
      description,
      url,
      siteName,
      type: "website",
      locale: locale === "es" ? "es_ES" : "en_US",
      images: [
        {
          url: profileImage,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
      images: [profileImage],
    },
    other: {
      'fb:app_id': process.env.NEXT_PUBLIC_FB_APP_ID,
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
        <I18nProvider initialLocale={locale}>
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
