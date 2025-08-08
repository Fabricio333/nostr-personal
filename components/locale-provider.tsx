"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react"
import { useRouter } from "next/navigation"
import en from "@/locales/en.json"
import es from "@/locales/es.json"

type Locale = "en" | "es"

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const translations: Record<Locale, any> = { en, es }

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key: string) => key,
})

function getNested(obj: any, path: string) {
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj)
}

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode
  initialLocale: Locale
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale)

  const router = useRouter()
  const firstRender = useRef(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("locale")
      if (stored === "en" || stored === "es") {
        const path = window.location.pathname
        const segment = path.split("/")[1]
        const pathLocale = segment === "en" || segment === "es" ? segment : null
        const currentLocale = pathLocale ?? initialLocale

        if (!pathLocale || stored === pathLocale) {
          if (stored !== currentLocale) {
            setLocale(stored as Locale)
          }
        }
      }
    }
  }, [initialLocale])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", locale)
      document.documentElement.lang = locale
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`
      const path = window.location.pathname
      if (firstRender.current) {
        firstRender.current = false
      } else {
        if (locale === "es" && !path.startsWith("/es")) {
          const target = path === "/" ? "/es" : `/es${path}`
          router.push(target)
        } else if (locale === "en" && path.startsWith("/es")) {
          const target = path.replace(/^\/es/, "") || "/"
          router.push(target)
        } else {
          router.refresh()
        }
      }
    }
  }, [locale, router])

  const t = (key: string) => {
    const value = getNested(translations[locale], key)
    return value || key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
