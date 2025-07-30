"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { getSettings } from "@/lib/settings"

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
  const [open, setOpen] = useState(false)

  return (
    <nav className="border-b bg-background">
      <div className="container flex items-center gap-4 py-4">
        <Link href="/" className="font-bold">
          {settings.siteName}
        </Link>
        {/* Desktop links */}
        <div className="ml-auto hidden flex-wrap gap-4 text-sm md:flex">
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
        {/* Mobile menu toggle */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="mt-4 flex flex-col space-y-4 pl-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
