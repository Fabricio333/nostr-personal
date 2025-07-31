"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { SearchBar } from "./search-bar"

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

  return (
    <nav className="border-b bg-background">
      <div className="container flex items-center gap-4 py-4">
        <Link href="/" className="font-bold">
          {siteName}
        </Link>
        <div className="ml-auto hidden flex-1 items-center gap-4 text-sm md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground"
            >
              {link.name}
            </Link>
          ))}
          <SearchBar className="ml-auto" />
        </div>
        <SearchBar className="ml-auto flex-1 md:hidden" />
        <button
          className="ml-2 md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-4">
          <button
            className="absolute right-4 top-4"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
          <SearchBar className="mb-8 w-full max-w-xs" />
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
