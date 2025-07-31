"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SearchBarProps {
  className?: string
}

export function SearchBar({ className }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [source, setSource] = useState("all")
  const router = useRouter()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    const params = new URLSearchParams({ q: query.trim(), source })
    router.push(`/search?${params.toString()}`)
  }

  return (
    <form onSubmit={onSubmit} className={`flex items-center gap-2 ${className ?? ""}`}>
      <Select value={source} onValueChange={setSource}>
        <SelectTrigger className="w-24">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="nostr">Nostr</SelectItem>
          <SelectItem value="article">Articles</SelectItem>
          <SelectItem value="garden">Garden</SelectItem>
        </SelectContent>
      </Select>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="w-40 pl-8 md:w-64"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
    </form>
  )
}

