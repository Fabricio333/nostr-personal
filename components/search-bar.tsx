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
import { cn } from "@/lib/utils"

interface SearchBarProps {
  className?: string
  onSearch?: () => void
}

export function SearchBar({ className, onSearch }: SearchBarProps) {
  const [term, setTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = term.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}&source=${filter}`)
    setTerm("")
    onSearch?.()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex items-center", className)}
    >
      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger className="w-24 rounded-r-none border-r-0 text-xs">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="nostr">Nostr</SelectItem>
          <SelectItem value="articles">Articles</SelectItem>
          <SelectItem value="garden">Garden</SelectItem>
        </SelectContent>
      </Select>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search..."
          className="pl-9 rounded-l-none"
        />
      </div>
    </form>
  )
}

export default SearchBar
