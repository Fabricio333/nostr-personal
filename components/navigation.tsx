"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSettings } from "@/lib/settings"
import { getNostrSettings } from "@/lib/nostr-settings"
import { fetchNostrProfile } from "@/lib/nostr"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Blog", href: "/blog" },
  { name: "Lifestyle", href: "/lifestyle" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Contact", href: "/contact" },
]

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [firstName, setFirstName] = useState(() => getSettings().siteName)

  useEffect(() => {
    const settings = getNostrSettings()
    if (!settings.ownerNpub) return

    fetchNostrProfile(settings.ownerNpub).then((profile) => {
      const name =
        profile?.display_name || profile?.name || profile?.nip05?.split("@")[0]
      if (name) {
        const first = name.trim().split(/\s+/)[0]
        if (first) setFirstName(first)
      }
    })
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">{firstName}</span>
          </Link>
          <nav className="flex items-center space-x-2">
            {navigation.map((item) => (
              <Button key={item.name} variant="ghost" asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "text-sm",
                    pathname === item.href ? "text-foreground" : "text-foreground/60",
                  )}
                >
                  {item.name}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
              <span className="font-bold">{firstName}</span>
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {navigation.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    asChild
                    className={cn(
                      "justify-start",
                      pathname === item.href ? "text-foreground" : "text-foreground/60",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href={item.href}>{item.name}</Link>
                  </Button>
                ))}

              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/" className="flex items-center space-x-2 md:hidden">
              <span className="font-bold">{firstName}</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-2">
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}
