import type { Metadata } from "next"
import HomePageClient from "./HomePageClient"
import { getCanonicalUrl } from "@/utils/getCanonicalUrl"
import { getLocaleFromPath } from "@/utils/getLocaleFromPath"

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getCanonicalUrl()
  const locale = getLocaleFromPath()
  const url = locale === "es" ? `${siteUrl}/es` : siteUrl
  return {
    alternates: { canonical: url },
    openGraph: { url },
  }
}

export default function HomePage() {
  return <HomePageClient />
}
