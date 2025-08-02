"use client"

import React, {createContext, useContext, useState, useEffect, ReactNode} from "react"
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

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("locale")
      if (stored === "en" || stored === "es") {
        return stored
      }
    }
    return "en"
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("locale", locale)
      document.documentElement.lang = locale
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`
    }
  }, [locale])

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
