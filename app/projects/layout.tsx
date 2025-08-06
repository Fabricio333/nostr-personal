import type React from "react"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import { getCanonicalUrl } from "@/utils/getCanonicalUrl"
import en from "@/locales/en.json"
import es from "@/locales/es.json"

export const revalidate = 60 * 60 * 24

const translations = { en, es } as const

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = cookies()
  const locale = (cookieStore.get("NEXT_LOCALE")?.value as "en" | "es") || "en"
  const dict = translations[locale]
  const siteUrl = getCanonicalUrl()
  const url = locale === "es" ? `${siteUrl}/es/projects` : `${siteUrl}/projects`
  const title = dict.projects.metadata.title
  const description = dict.projects.metadata.description

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/projects`,
        es: `${siteUrl}/es/projects`,
      },
    },
    openGraph: {
      title,
      description,
      url,
    },
    twitter: {
      title,
      description,
    },
  }
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
