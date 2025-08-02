"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n } from "@/components/locale-provider"
import { useRouter } from "next/navigation"

export function LanguageToggle() {
  const { locale, setLocale } = useI18n()
  const router = useRouter()

  return (
    <Select
      value={locale}
      onValueChange={(v) => {
        setLocale(v as "en" | "es")
        router.refresh()
      }}
    >
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
