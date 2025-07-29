import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getSettings } from "@/lib/settings"

const inter = Inter({ subsets: ["latin"] })

const settings = getSettings()

export const metadata: Metadata = {
  title: settings.siteName,
  description: settings.siteDescription,
  generator: "v0.dev",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: settings.siteName,
    description: settings.siteDescription,
    images: ["/icon.svg"],
  },
  twitter: {
    card: "summary",
    title: settings.siteName,
    description: settings.siteDescription,
    images: ["/icon.svg"],
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

const navigation = [
  { name: "Home", href: "/" },
  { name: "Blog", href: "/blog" },
  { name: "Lifestyle", href: "/lifestyle" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Contact", href: "/contact" },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <nav className="sticky top-0 z-50 flex gap-2 border-b bg-background p-2">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className="flex">
              <Button variant="ghost" size="sm" className="text-sm">
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
