import type { Metadata } from "next"
import BlogPageClient from "./BlogPageClient"
import { getLocaleFromPath } from "@/utils/getLocaleFromPath"
import { getCanonicalUrl } from "@/utils/getCanonicalUrl"
import { getSettings } from "@/lib/settings"
import en from "@/locales/en.json"
import es from "@/locales/es.json"

export async function generateMetadata(): Promise<Metadata> {
  const locale = getLocaleFromPath()
  const siteUrl = getCanonicalUrl()
  const path = locale === "es" ? "/es/blog" : "/blog"
  const url = `${siteUrl}${path}`
  const { siteName } = getSettings()
  const translations: Record<string, any> = { en, es }
  const t = translations[locale]?.blog || {}
  const title = `${t.title || "Blog"} - ${siteName}`
  const description = t.subtitle as string | undefined
  const image = "/profile-picture.png"
  const ogLocale = locale === "es" ? "es_ES" : "en_US"
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/blog`,
        es: `${siteUrl}/es/blog`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      locale: ogLocale,
      alternateLocale: ogLocale === "es_ES" ? ["en_US"] : ["es_ES"],
      images: [
        { url: image, width: 1200, height: 630, alt: title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  }
}

export default function BlogPage() {
  return <BlogPageClient />
}
