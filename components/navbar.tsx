import { useState } from "react"
import Link from "next/link"
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
  const [open, setOpen] = useState(false)

  return (
    <nav className="border-b bg-background">
      <div className="container flex items-center gap-4 py-4">
        <Link href="/" className="font-bold">
          {siteName}
        </Link>
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
        <button
          className="ml-auto md:hidden"
          aria-label="Toggle Menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background">
          <button
            className="absolute right-4 top-4"
            aria-label="Close Menu"
            onClick={() => setOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xl font-medium text-foreground"
              onClick={() => setOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
