import Link from "next/link"

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
  return (
    <nav className="border-b bg-background">
      <div className="container px-4 flex items-center gap-4 py-4">
        <Link href="/" className="font-bold">
          {siteName}
        </Link>
        <div className="ml-auto flex flex-wrap gap-4 text-sm">
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
      </div>
    </nav>
  )
}
