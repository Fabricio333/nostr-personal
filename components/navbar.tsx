"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getSettings } from "@/lib/settings"
import { getNostrSettings } from "@/lib/nostr-settings"
import { fetchNostrProfile } from "@/lib/nostr"

const links = [
  { name: "Home", href: "/" },
  { name: "Blog", href: "/blog" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Resume", href: "/resume" },
  { name: "Lifestyle", href: "/lifestyle" },
  { name: "Contact", href: "/contact" },
]

const settings = getSettings()

export function Navbar() {
  const [siteName, setSiteName] = useState(settings.siteName)

  useEffect(() => {
    const nostrSettings = getNostrSettings()
    if (!nostrSettings.ownerNpub) return

    fetchNostrProfile(nostrSettings.ownerNpub).then((profile) => {
      const name =
        profile?.display_name || profile?.name || nostrSettings.ownerNpub
      if (name) setSiteName(name)
    })
  }, [])

  return (
    <nav className="border-b bg-background">
      <div className="container flex flex-wrap items-center justify-between py-4">
        <Link href="/" className="font-bold">
          {siteName}
        </Link>
        <div className="flex flex-wrap gap-4 ml-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
