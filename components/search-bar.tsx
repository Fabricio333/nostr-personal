"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export function SearchBar() {
  const [term, setTerm] = useState("")
  const [source, setSource] = useState("nostr")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (term) params.set("q", term)
    if (source) params.set("source", source)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search..."
          className="pl-8 w-40 md:w-64"
        />
      </div>
      <Select value={source} onValueChange={setSource}>
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder="Nostr" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="nostr">Nostr</SelectItem>
          <SelectItem value="article">Articles</SelectItem>
          <SelectItem value="garden">Garden</SelectItem>
        </SelectContent>
      </Select>
    </form>
  )
}

export default SearchBar

