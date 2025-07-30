"use client"

import { useState, useEffect } from "react"
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
  const [firstName, setFirstName] = useState(settings.siteName)

  useEffect(() => {
    const nostrSettings = getNostrSettings()
    if (!nostrSettings.ownerNpub) return

    fetchNostrProfile(nostrSettings.ownerNpub).then((profile) => {
      const name =
        profile?.display_name || profile?.name || profile?.nip05?.split("@")[0]
      if (name) {
        const first = name.trim().split(/\s+/)[0]
        if (first) setFirstName(first)
      }
    })
  }, [])

  return (
    <nav className="border-b bg-background">
      <div className="container flex flex-wrap gap-4 py-4 justify-end">
        <Link href="/" className="font-bold">
          {firstName}
        </Link>
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
    </nav>
  )
}
