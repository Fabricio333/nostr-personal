"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/components/locale-provider"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { localizePath, stripLocale } from "@/lib/utils"

export function LanguageToggle() {
  const { locale, setLocale } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const changeLocale = (v: "en" | "es") => {
    const base = stripLocale(pathname)
    const query = params.toString()
    const path = query ? `${base}?${query}` : base
    router.push(localizePath(v, path))
    setLocale(v)
  }

  return (
    <Select value={locale} onValueChange={(v) => changeLocale(v as "en" | "es")}>
      <SelectTrigger className="w-[80px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">EN</SelectItem>
        <SelectItem value="es">ES</SelectItem>
      </SelectContent>
    </Select>
  )
}
