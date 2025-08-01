"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import { SearchBar } from "@/components/search-bar"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useI18n } from "@/components/locale-provider"

interface NavbarProps {
  siteName: string
}

const links = [
  { key: "home", href: "/" },
  { key: "blog", href: "/blog" },
  { key: "projects", href: "/projects" },
  { key: "resume", href: "/resume" },
  { key: "lifestyle", href: "/lifestyle" },
  { key: "garden", href: "/digital-garden" },
  { key: "contact", href: "/contact" },
]

export function Navbar({ siteName }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const { t } = useI18n()

  return (
    <nav className="border-b bg-background">
      <div className="container flex items-center gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Image src="/icon.svg" alt="" width={24} height={24} />
          <span>{siteName}</span>
        </Link>
        <div className="ml-auto hidden items-center gap-4 text-sm md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground"
            >
              {t(`navbar.${link.key}`)}
            </Link>
          ))}
          <SearchBar />
          <LanguageToggle />
          <ModeToggle />
        </div>
        <button
          className="ml-auto md:hidden"
          onClick={() => setOpen(true)}
          aria-label={t("navbar.open_menu")}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
          <button
            className="absolute right-4 top-4"
            onClick={() => setOpen(false)}
            aria-label={t("navbar.close_menu")}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex flex-col items-center gap-8 text-lg">
            <SearchBar />
            <ModeToggle />
            <LanguageToggle />
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="hover:text-primary"
              >
                {t(`navbar.${link.key}`)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
