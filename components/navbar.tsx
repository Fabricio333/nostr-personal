import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

interface NavbarProps {
  siteName: string
}

const links = [
  { name: "Home", href: "/" },
  { name: "Blog", href: "/blog" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Resume", href: "/resume" },
  { name: "Lifestyle", href: "/lifestyle" },
  { name: "Contact", href: "/contact" },
]

export function Navbar({ siteName }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="border-b bg-background w-full">
      <div className="mx-auto flex w-full max-w-screen-xl items-center gap-4 px-4 py-4">
        <Link href="/" className="font-bold">
          {siteName}
        </Link>
        <div className="ml-auto hidden md:flex flex-wrap gap-4 text-sm">
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
        <button
          className="ml-auto md:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background">
          <button
            className="absolute right-4 top-4"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-2xl text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
