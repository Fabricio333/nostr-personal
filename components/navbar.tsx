import Link from "next/link"
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
  return (
    <nav className="border-b bg-background">
      <div className="container flex flex-wrap gap-4 py-4">
        <Link href="/" className="font-bold">
          {settings.siteName}
        </Link>
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}
