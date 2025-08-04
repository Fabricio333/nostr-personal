"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import { useI18n } from "@/components/locale-provider"

export function SearchBar() {
  const [term, setTerm] = useState("")
  const [source, setSource] = useState("all")
  const router = useRouter()
  const { t, locale } = useI18n()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (term) params.set("q", term)
    if (source) params.set("source", source)
    const base = locale === 'es' ? '/es/search' : '/search'
    router.push(`${base}?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={t("search.placeholder")}
          className="pl-8 w-40 md:w-64"
        />
      </div>
      <Select value={source} onValueChange={setSource}>
        <SelectTrigger
          className={cn(
            "w-[130px]",
            source === "all" && "text-blue-500",
            source === "nostr" && "text-purple-500",
            source === "article" && "text-orange-500",
            source === "garden" && "text-green-500"
          )}
        >
          <SelectValue placeholder={t("search.filter")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-blue-500">
            {t("search.all")}
          </SelectItem>
          <SelectItem value="nostr" className="text-purple-500">
            {t("search.nostr")}
          </SelectItem>
          <SelectItem value="article" className="text-orange-500">
            {t("search.articles")}
          </SelectItem>
          <SelectItem value="garden" className="text-green-500">
            {t("search.garden")}
          </SelectItem>
        </SelectContent>
      </Select>
    </form>
  )
}

export default SearchBar

