"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

interface NavbarProps {
  siteName: string
}

const links = [
  { name: "Home", href: "/" },
  { name: "Blog", href: "/blog" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Resume", href: "/resume" },
  { name: "Lifestyle", href: "/lifestyle" },
  { name: "Garden", href: "/digital-garden" },
  { name: "Contact", href: "/contact" },
]

export function Navbar({ siteName }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return
    router.push(`/search?q=${encodeURIComponent(searchTerm)}&filter=${filter}`)
    setSearchTerm("")
  }

  return (
    <nav className="border-b bg-background">
      <div className="container flex items-center gap-4 py-4">
        <Link href="/" className="font-bold">
          {siteName}
        </Link>
        <div className="hidden flex-wrap gap-4 text-sm md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground"
            >
              {link.name}
            </Link>
          ))}
        </div>
        <form
          onSubmit={handleSearch}
          className="relative ml-auto hidden items-center md:flex"
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 pl-8 pr-20 bg-slate-100 dark:bg-slate-700 border-0"
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="absolute right-1 top-1/2 h-7 w-20 -translate-y-1/2 border-0 bg-transparent p-0 text-xs">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="nostr">Nostr</SelectItem>
              <SelectItem value="articles">Articles</SelectItem>
              <SelectItem value="garden">Garden</SelectItem>
            </SelectContent>
          </Select>
        </form>
        <button
          className="ml-2 md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
          <button
            className="absolute right-4 top-4"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex flex-col items-center gap-8 text-lg">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
